const { MongoClient } = require('mongodb');
const GameLobbyStore = require('../GameLobbyStore'); // Adjust the path as needed

// ChatGPT usage: Partial
jest.mock('mongodb', () => {
  const mCollection = {
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
    deleteOne: jest.fn()
  };

  const mDB = {
    collection: jest.fn().mockReturnValue(mCollection)
  };

  const mClient = {
    connect: jest.fn(),
    db: jest.fn().mockReturnValue(mDB),
    close: jest.fn()
  };

  return { MongoClient: jest.fn(() => mClient) };
});

describe('GameLobbyStore', () => {
  let gameLobbyStore;
  let mockClient;
  let mockDB;
  let mockCollection;

  // ChatGPT usage: Partial
  beforeEach(async () => {
    mockClient = new MongoClient();
    mockDB = mockClient.db();
    mockCollection = mockDB.collection();

    gameLobbyStore = new GameLobbyStore("mongodb://localhost:27017", "testDB");
    await gameLobbyStore.init();
  });

  // ChatGPT usage: Partial
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    // ChatGPT usage: Partial
    // Input: none
    // Expected behavior: Database connection is established and collection is set
    // Expected output: 'connect' and 'collection' methods are called
    it('should initialize the database connection and collection', async () => {
      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockDB.collection).toHaveBeenCalledWith('lobbies');
    });
  });

  describe('insertLobby', () => {
    // ChatGPT usage: Partial
    // Input: roomName, gameType, maxPlayer
    // Expected behavior: A new lobby is added to the database
    // Expected output: 'insertOne' method is called with correct lobby data
    it('should insert a new lobby into the collection', async () => {
      await gameLobbyStore.insertLobby('room123', 'Roulette', 4);
      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        roomName: 'room123',
        gameType: 'Roulette',
        gameStarted: false,
        maxPlayers: 4,
        players: {}
      });
    });
  });

  describe('updateLobby', () => {
    // ChatGPT usage: Partial
    // Input: roomName, gameStarted
    // Expected behavior: Specified lobby is updated with new data
    // Expected output: 'updateOne' method is called with correct update data
    it('should update a lobby in the collection', async () => {
      const updateData = { gameStarted: true };
      await gameLobbyStore.updateLobby('room123', updateData);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { roomName: 'room123' },
        { $set: updateData }
      );
    });
  });

  describe('setPlayerReady', () => {
    // ChatGPT usage: Partial
    // Input: roomName, userName
    // Expected behavior: Player 'user1' in 'room123' is marked as ready
    // Expected output: 'updateOne' method is called to set the player as ready
    it('should set a player ready in a lobby', async () => {
      await gameLobbyStore.setPlayerReady('room123', 'user1');
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { roomName: 'room123' },
        { $set: { 'players.user1.ready': true } }
      );
    });
  });

  describe('getLobby', () => {
    // ChatGPT usage: Partial
    // Input: roomName
    // Expected behavior: Lobby 'room123' is fetched from the database
    // Expected output: 'findOne' method is called with the correct room name
    it('should retrieve a lobby', async () => {
      await gameLobbyStore.getLobby('room123');
      expect(mockCollection.findOne).toHaveBeenCalledWith({ roomName: 'room123' });
    });
  });

  describe('getAllLobby', () => {
    // ChatGPT usage: Partial
    // Input: none
    // Expected behavior: All lobbies are fetched from the database
    // Expected output: 'find' and 'toArray' methods are called
    it('should retrieve all lobbies', async () => {
      await gameLobbyStore.getAllLobby();
      expect(mockCollection.find).toHaveBeenCalled();
      expect(mockCollection.toArray).toHaveBeenCalled();
    });
  });

  describe('deleteLobby', () => {
    // ChatGPT usage: No
    // Input: roomName
    // Expected behavior: Lobby 'room123' is deleted from the database
    // Expected output: 'deleteOne' method is called with the correct room name
    it('should delete a lobby', async () => {
      await gameLobbyStore.deleteLobby('room123');
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ roomName: 'room123' });
    });
  });

  describe('setPlayerBet', () => {
    // ChatGPT usage: No
    // Input: roomName, userName, bet
    // Expected behavior: Player 'user1's bet in lobby 'room123' is set to 100
    // Expected output: 'updateOne' method is called to set the player's bet
    it('should set a player bet in a lobby', async () => {
      await gameLobbyStore.setPlayerBet('room123', 'user1', 100);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { roomName: 'room123' },
        { $set: { 'players.user1.bet': 100 } }
      );
    });
  });

  describe('getPlayerCount', () => {
    // ChatGPT usage: No
    // Input: roomName
    // Expected behavior: Player count in lobby 'room123' is retrieved
    // Expected output: 'findOne' method is called and player count is returned
    it('should retrieve the player count for a lobby', async () => {
      mockCollection.findOne.mockResolvedValue({
        players: { 'user1': { ready: true }, 'user2': { ready: false } }
      });
      const result = await gameLobbyStore.getPlayerCount('room123');
      expect(mockCollection.findOne).toHaveBeenCalledWith({ roomName: 'room123' });
      expect(result).toEqual({ tp: 2, pr: 1 });
    });
  });

  describe('close', () => {
    // ChatGPT usage: No
    // Input: none
    // Expected behavior: Database connection is closed
    // Expected output: 'close' method is called
    it('should close the database connection', async () => {
      await gameLobbyStore.close();
      expect(mockClient.close).toHaveBeenCalled();
    });
  });
});
