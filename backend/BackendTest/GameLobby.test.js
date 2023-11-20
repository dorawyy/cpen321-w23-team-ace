const GameLobby = require('../GameLobby');
const GameLobbyStore = require('../GameLobbyStore');
const emitMock = jest.fn();

const ioMock = {
  to: jest.fn().mockImplementation(() => {
      return {
          emit: emitMock,
          join: jest.fn(),
          leave: jest.fn()
      };
  })
};

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

describe('GameLobby', () => {
  let gameLobby;
  let gameLobbyStoreMock;
  let socketMock;

  beforeAll(() => {
    gameLobbyStoreMock = new GameLobbyStore();
    gameLobby = new GameLobby(null, gameLobbyStoreMock, ioMock);
    socketMock = { id: 'socket123', emit: jest.fn(), join: jest.fn(), leave: jest.fn() };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should create a new lobby correctly', async () => {
      gameLobbyStoreMock.getLobby.mockResolvedValue(null);
      gameLobbyStoreMock.insertLobby.mockResolvedValue(true);

      await gameLobby.init('room123', 'Roulette', 0, socketMock);

      expect(gameLobbyStoreMock.getLobby).toHaveBeenCalledWith('room123');
      expect(gameLobbyStoreMock.insertLobby).toHaveBeenCalledWith('room123', 'Roulette', 0);
      expect(socketMock.emit).toHaveBeenCalledWith('lobbyCreated', expect.any(String));
    });

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

  describe('addPlayer', () => {
    it('should add a player to the lobby correctly', async () => {
      gameLobbyStoreMock.getLobby.mockResolvedValue({ players: {}, maxPlayers: 4 });

      await gameLobby.addPlayer('room123', 'user1', 100, socketMock);

      expect(gameLobbyStoreMock.getLobby).toHaveBeenCalledWith('room123');
      expect(ioMock.to).toHaveBeenCalledWith('room123');
      expect(socketMock.join).toHaveBeenCalledWith('room123');
      expect(gameLobbyStoreMock.updateLobby).toHaveBeenCalledWith('room123', expect.any(Object));
    });

    it('should emit "PlayerExceedMax" if the lobby is full', async () => {
        const mockLobby = {
          players: { 'user1': {}, 'user2': {}, 'user3': {}, 'user4': {} },
          maxPlayers: 4
        };
        gameLobbyStoreMock.getLobby.mockResolvedValue(mockLobby);
    
        await gameLobby.addPlayer('room123', 'user5', 100, socketMock);
    
        expect(socketMock.emit).toHaveBeenCalledWith('PlayerExceedMax', "PlayerExceedMax");
      });

    it('should emit "roomDoesNot" if the lobby does not exist', async () => {
    gameLobbyStoreMock.getLobby.mockResolvedValue(null);

    await gameLobby.addPlayer('nonExistentRoom', 'user1', 100, socketMock);

    expect(socketMock.emit).toHaveBeenCalledWith('roomDoesNot', "Room does not exist");
    });
  });

  describe('removePlayer', () => {
    it('should remove a player from the lobby correctly', async () => {
      gameLobbyStoreMock.getAllLobby.mockResolvedValue([
        { roomName: 'room123', players: { 'user1': { socketId: 'socket123' } } }
      ]);

      await gameLobby.removePlayer(socketMock);

      expect(ioMock.to).toHaveBeenCalledWith('room123');
      expect(socketMock.leave).toHaveBeenCalledWith('room123');
      expect(gameLobbyStoreMock.updateLobby).toHaveBeenCalledWith('room123', expect.any(Object));
    });

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

  describe('setPlayerReady', () => {
    it('should set a player ready in the lobby correctly', async () => {
      gameLobbyStoreMock.getLobby.mockResolvedValue({
        players: { 'user1': { ready: false } }
      });

      await gameLobby.setPlayerReady('room123', 'user1');

      expect(ioMock.to).toHaveBeenCalledWith('room123');
      expect(gameLobbyStoreMock.setPlayerReady).toHaveBeenCalledWith('room123', 'user1');
    });

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

  describe('setPlayerBet', () => {
    it('should set a player bet correctly', async () => {
      await gameLobby.setPlayerBet('room123', 'user1', 100);

      expect(ioMock.to).toHaveBeenCalledWith('room123');
      expect(gameLobbyStoreMock.setPlayerBet).toHaveBeenCalledWith('room123', 'user1', 100);
    });
  });

  describe('sendChatMessage', () => {
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
    it('should delete a lobby correctly', async () => {
      await gameLobby.deleteLobby('room123');

      expect(gameLobbyStoreMock.deleteLobby).toHaveBeenCalledWith('room123');
    });
  });

  describe('getLobby', () => {
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

  describe('getAllLobby', () => {
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

  describe('getPlayerCount', () => {
    it('should retrieve player count correctly', async () => {
      gameLobbyStoreMock.getPlayerCount.mockResolvedValue(5); // Mocked player count

      const count = await gameLobby.getPlayerCount('room123');

      expect(gameLobbyStoreMock.getPlayerCount).toHaveBeenCalledWith('room123');
      expect(ioMock.to).toHaveBeenCalledWith('room123');
      expect(count).toBe(5);
    });
  });

});
