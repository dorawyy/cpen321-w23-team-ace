const GameLobby = require('../GameLobby');
const GameLobbyStore = require('../GameLobbyStore');
const emitMock = jest.fn();

// ChatGPT usage: Partial
const ioMock = {
  to: jest.fn().mockImplementation(() => {
      return {
          emit: emitMock,
          join: jest.fn(),
          leave: jest.fn()
      };
  })
};

// ChatGPT usage: No
jest.mock('../GameLobbyStore', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getLobby: jest.fn(),
      insertLobby: jest.fn(),
      updateLobby: jest.fn(),
      deleteLobby: jest.fn(),
      getAllLobby: jest.fn(),
      getPlayerCount: jest.fn(),
      setPlayerReady: jest.fn(),
      setPlayerBet: jest.fn(),
    };
  });
});

// chatGPT usage: No
describe('GameLobby', () => {
  let gameLobby;
  let gameLobbyStoreMock;
  let socketMock;

  // ChatGPT usage: Partial
  beforeAll(() => {
    gameLobbyStoreMock = new GameLobbyStore();
    gameLobby = new GameLobby(null, gameLobbyStoreMock, ioMock);
    socketMock = { id: 'socket123', emit: jest.fn(), join: jest.fn(), leave: jest.fn() };
  });

  // ChatGPT usage: Yes
  beforeEach(() => {
    jest.clearAllMocks();
  });

  
  describe('init', () => {
    // ChatGPT usage: Partial
    // Input: roomName, gameType, bet = 0, socket
    // Expected behavior: Lobby 'room123' is created
    // Expected output: Emit 'lobbyCreated'
    it('should create a new lobby correctly', async () => {
      gameLobbyStoreMock.getLobby.mockResolvedValue(null);
      gameLobbyStoreMock.insertLobby.mockResolvedValue(true);

      await gameLobby.init('room123', 'Roulette', 0, socketMock);

      expect(gameLobbyStoreMock.getLobby).toHaveBeenCalledWith('room123');
      expect(gameLobbyStoreMock.insertLobby).toHaveBeenCalledWith('room123', 'Roulette', 0);
      expect(socketMock.emit).toHaveBeenCalledWith('lobbyCreated', expect.any(String));
    });

    // ChatGPT usage: Partial
    // Input: roomName (already exist), gameType, bet = 0, socket
    // Expected behavior: No duplicate lobby creation
    // Expected output: Emit 'roomAlreadyExist'
    it('should emit "roomAlreadyExist" if the lobby already exists', async () => {
        const mockLobby = {
          roomName: 'room123',
          gameType: 'Roulette',
          maxPlayers: 4,
          players: {}
        };
        gameLobbyStoreMock.getLobby.mockResolvedValue(mockLobby);
    
        await gameLobby.init('room123', 'Roulette', 4, socketMock);
    
        expect(socketMock.emit).toHaveBeenCalledWith('roomAlreadyExist', "Room already exist");
    });
  });

  // Interface socket event 'joinLobby'
  describe('addPlayer', () => {
    // ChatGPT usage: Partial
    // Input: roomName, userName, bet, socket
    // Expected behavior: Player 'user1' is added to 'room123'
    // Expected output: Player added and lobby updated
    it('should add a player to the lobby correctly', async () => {
      gameLobbyStoreMock.getLobby.mockResolvedValue({ players: {}, maxPlayers: 4 });

      await gameLobby.addPlayer('room123', 'user1', 100, socketMock);

      expect(gameLobbyStoreMock.getLobby).toHaveBeenCalledWith('room123');
      expect(ioMock.to).toHaveBeenCalledWith('room123');
      expect(socketMock.join).toHaveBeenCalledWith('room123');
      expect(gameLobbyStoreMock.updateLobby).toHaveBeenCalledWith('room123', expect.any(Object));
    });

    // ChatGPT usage: Partial
    // Input: roomName (that is full), userName, bet, socket
    // Expected behavior: Player 'user5' not added due to full lobby
    // Expected output: Emit 'PlayerExceedMax'
    it('should emit "PlayerExceedMax" if the lobby is full', async () => {
        const mockLobby = {
          players: { 'user1': {}, 'user2': {}, 'user3': {}, 'user4': {} },
          maxPlayers: 4
        };
        gameLobbyStoreMock.getLobby.mockResolvedValue(mockLobby);
    
        await gameLobby.addPlayer('room123', 'user5', 100, socketMock);
    
        expect(socketMock.emit).toHaveBeenCalledWith('PlayerExceedMax', "PlayerExceedMax");
    });

    // ChatGPT usage: Partial
    // Input: roomName (not exist), userName, bet, socket
    // Expected behavior: Cannot add player to non-existent lobby
    // Expected output: Emit 'roomDoesNot'
    it('should emit "roomDoesNot" if the lobby does not exist', async () => {
    gameLobbyStoreMock.getLobby.mockResolvedValue(null);

    await gameLobby.addPlayer('nonExistentRoom', 'user1', 100, socketMock);

    expect(socketMock.emit).toHaveBeenCalledWith('roomDoesNot', "Room does not exist");
    });
  });

  // Interface socket event 'leaveLobby'
  describe('removePlayer', () => {
    // ChatGPT usage: Partial
    // Input: socket (with associated lobby)
    // Expected behavior: Player associated with socketMock is removed from the lobby
    // Expected output: Lobby is updated, and 'playerLeft' event is emitted
    it('should remove a player from the lobby correctly', async () => {
      gameLobbyStoreMock.getAllLobby.mockResolvedValue([
        { roomName: 'room123', players: { 'user1': { socketId: 'socket123' } } }
      ]);

      await gameLobby.removePlayer(socketMock);

      expect(ioMock.to).toHaveBeenCalledWith('room123');
      expect(socketMock.leave).toHaveBeenCalledWith('room123');
      expect(gameLobbyStoreMock.updateLobby).toHaveBeenCalledWith('room123', expect.any(Object));
    });

    // ChatGPT usage: No
    // Input: socket (with no associated lobby)
    // Expected behavior: No player is removed
    // Expected output: No lobby update or 'playerLeft' event
    it('should not remove a player if their socket ID is not found in any lobby', async () => {
        gameLobbyStoreMock.getAllLobby.mockResolvedValue([
          { roomName: 'room123', players: { 'user1': { socketId: 'socket456' } } },
          { roomName: 'room124', players: { 'user2': { socketId: 'socket789' } } }
        ]);
    
        await gameLobby.removePlayer({ id: 'socket123', leave: jest.fn() });
    
        expect(gameLobbyStoreMock.updateLobby).not.toHaveBeenCalled();
        expect(socketMock.leave).not.toHaveBeenCalled();
    });
  });

  // ChatGPT usage: Partial
  // Interface socket event 'setReady'
  describe('setPlayerReady', () => {
    // Input: roomName, userName
    // Expected behavior: Player 'user1' in lobby 'room123' is marked as ready
    // Expected output: Lobby state updated, 'playerReady' event emitted
    it('should set a player ready in the lobby correctly', async () => {
      gameLobbyStoreMock.getLobby.mockResolvedValue({
        players: { 'user1': { ready: false } }
      });

      await gameLobby.setPlayerReady('room123', 'user1');

      expect(ioMock.to).toHaveBeenCalledWith('room123');
      expect(gameLobbyStoreMock.setPlayerReady).toHaveBeenCalledWith('room123', 'user1');
    });

    // Input: roomName
    // Expected behavior: Game starts in lobby 'room123'
    // Expected output: Lobby state updated, game started
    it('should start the game when all players are ready', async () => {
        const mockLobbyBeforeReady = {
            roomName: 'room123',
            gameType: 'Blackjack',
            players: {
              'user1': { ready: true, bet: 50 },
              'user2': { ready: true, bet: 75 },
              'user3': { ready: true, bet: 100 }
            },
            maxPlayers: 3,
            gameStarted: false
        };
      
        const mockLobbyAfterReady = {
          ...mockLobbyBeforeReady,
          players: {
            'user1': { ready: true, bet: 50 },
            'user2': { ready: true, bet: 75 },
            'user3': { ready: true, bet: 100 }
          }
        };
      
        gameLobbyStoreMock.getLobby
          .mockResolvedValueOnce(mockLobbyBeforeReady)
          .mockResolvedValueOnce(mockLobbyAfterReady)
      
        gameLobby.gameManager = { startGame: jest.fn() };
      
        await gameLobby.setPlayerReady('room123', 'user3');
      
        expect(ioMock.to).toHaveBeenCalledWith('room123');
        expect(ioMock.to().emit).toHaveBeenCalledWith('playerReady', 'user3');
        expect(ioMock.to().emit).toHaveBeenCalledWith('playerCount', undefined);         
    });
  });
  
  describe('startGame', () => {
    // ChatGPT usage: Partial
    // Input: roomName
    // Expected behavior: Game starts in lobby 'room123'
    // Expected output: Emit 'gameStarted' and update lobby state
    it('should start a game correctly', async () => {
      gameLobbyStoreMock.getLobby.mockResolvedValue({
        gameType: 'Roulette',
        players: { 'user1': { ready: true, bet: 100 } },
        gameStarted: false
      });

      gameLobby.gameManager = {
        startGame: jest.fn()
      };

      await gameLobby.startGame('room123');

      expect(ioMock.to).toHaveBeenCalledWith('room123');
      expect(gameLobbyStoreMock.updateLobby).toHaveBeenCalledWith('room123', expect.any(Object));
    });

    // ChatGPT usage: Partial
    // Input: roomName
    // Expected behavior: Game does not start
    // Expected output: No 'gameStarted' event emitted
    it('should not start the game if gameManager is not initialized', async () => {
        const mockLobby = {
          roomName: 'room123',
          gameType: 'Roulette',
          players: {
            'user1': { ready: true, bet: 50 },
          },
          maxPlayers: 3,
          gameStarted: false
        };
        gameLobbyStoreMock.getLobby.mockResolvedValue(mockLobby);
        gameLobby.gameManager = null;
    
        await gameLobby.startGame('room123');
    
        expect(ioMock.to().emit).not.toHaveBeenCalledWith('gameStarted');
        expect(gameLobby.gameManager).toBeNull();
      });
    });

  // Interface socket event 'setBet'
  describe('setPlayerBet', () => {
    // ChatGPT usage: Partial
    // Input: roomName, userName, bet
    // Expected behavior: Player 'user1' bet is set to 100 in lobby 'room123'
    // Expected output: Lobby state updated, 'setBet' event emitted
    it('should set a player bet correctly', async () => {
      await gameLobby.setPlayerBet('room123', 'user1', 100);

      expect(ioMock.to).toHaveBeenCalledWith('room123');
      expect(gameLobbyStoreMock.setPlayerBet).toHaveBeenCalledWith('room123', 'user1', 100);
    });
  });

  // Interface socket event 'sendChatMessage'
  describe('sendChatMessage', () => {
    // ChatGPT usage: Yes
    // Input: roomName, userName, message
    // Expected behavior: Message 'Hello World' from 'user1' is sent in lobby 'room123'
    // Expected output: 'receiveChatMessage' event emitted with the message
    it('should send a chat message correctly', async () => {
      await gameLobby.sendChatMessage('room123', 'user1', 'Hello World');
  
      expect(ioMock.to).toHaveBeenCalledWith('room123');
      expect(emitMock).toHaveBeenCalledWith('receiveChatMessage', {
        user: 'user1',
        text: 'Hello World',
      });
    });
  });

  describe('deleteLobby', () => {
    // ChatGPT usage: Partial
    // Input: roomName
    // Expected behavior: Lobby 'room123' is deleted
    // Expected output: Lobby is removed from the store
    it('should delete a lobby correctly', async () => {
      await gameLobby.deleteLobby('room123');

      expect(gameLobbyStoreMock.deleteLobby).toHaveBeenCalledWith('room123');
    });
  });

  describe('getLobby', () => {
    // ChatGPT usage: Partial
    // Input: roomName
    // Expected behavior: Details of lobby 'room123' are retrieved
    // Expected output: Lobby data is returned
    it('should retrieve a lobby correctly', async () => {
      gameLobbyStoreMock.getLobby.mockResolvedValue({
        roomName: 'room123',
        gameType: 'Blackjack',
        players: {'user1': {bet: 100, ready: false, socketId: 'socket123'}},
        maxPlayers: 4
      });

      const lobby = await gameLobby.getLobby('room123');

      expect(gameLobbyStoreMock.getLobby).toHaveBeenCalledWith('room123');
      expect(lobby).toBeDefined();
      expect(lobby.roomName).toBe('room123');
    });
  });

  // Interface socket event 'getAllLobby'
  describe('getAllLobby', () => {
    // ChatGPT usage: Partial
    // Input: None
    // Expected behavior: All lobbies are retrieved
    // Expected output: Array of all lobbies is returned
    it('should retrieve all lobbies correctly', async () => {
      gameLobbyStoreMock.getAllLobby.mockResolvedValue([
        {
          roomName: 'room123',
          gameType: 'BlackJack',
          players: {'user1': {bet: 100, ready: false, socketId: 'socket123'}},
          maxPlayers: 4
        },
        {
          roomName: 'room124',
          gameType: 'Baccarat',
          players: {'user2': {bet: {win: "PlayersWin", amount: 3}, ready: true, socketId: 'socket124'}},
          maxPlayers: 6
        }
      ]);

      const lobbies = await gameLobby.getAllLobby(socketMock);

      expect(gameLobbyStoreMock.getAllLobby).toHaveBeenCalled();
      expect(socketMock.emit).toHaveBeenCalledWith('AllLobby', expect.any(Array));
      expect(lobbies).toBeDefined();
      expect(lobbies.length).toBe(2);
    });
  });

  // Interface socket event 'getPlayerCount'
  describe('getPlayerCount', () => {
    // ChatGPT usage: Partial
    // Input: roomName
    // Expected behavior: Player count in lobby 'room123' is retrieved
    // Expected output: Player count is returned
    it('should retrieve player count correctly', async () => {
      gameLobbyStoreMock.getPlayerCount.mockResolvedValue(5); // Mocked player count

      const count = await gameLobby.getPlayerCount('room123');

      expect(gameLobbyStoreMock.getPlayerCount).toHaveBeenCalledWith('room123');
      expect(ioMock.to).toHaveBeenCalledWith('room123');
      expect(count).toBe(5);
    });
  });

});
