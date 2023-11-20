const { MongoClient } = require('mongodb');
const GameLobbyStore = require('../GameLobbyStore'); // Adjust the path as needed

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

  beforeEach(async () => {
    mockClient = new MongoClient();
    mockDB = mockClient.db();
    mockCollection = mockDB.collection();

    gameLobbyStore = new GameLobbyStore("mongodb://localhost:27017", "testDB");
    await gameLobbyStore.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize the database connection and collection', async () => {
      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockDB.collection).toHaveBeenCalledWith('lobbies');
    });
  });

  describe('insertLobby', () => {
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
    it('should set a player ready in a lobby', async () => {
      await gameLobbyStore.setPlayerReady('room123', 'user1');
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { roomName: 'room123' },
        { $set: { 'players.user1.ready': true } }
      );
    });
  });

  describe('getLobby', () => {
    it('should retrieve a lobby', async () => {
      await gameLobbyStore.getLobby('room123');
      expect(mockCollection.findOne).toHaveBeenCalledWith({ roomName: 'room123' });
    });
  });

  describe('getAllLobby', () => {
    it('should retrieve all lobbies', async () => {
      await gameLobbyStore.getAllLobby();
      expect(mockCollection.find).toHaveBeenCalled();
      expect(mockCollection.toArray).toHaveBeenCalled();
    });
  });

  describe('deleteLobby', () => {
    it('should delete a lobby', async () => {
      await gameLobbyStore.deleteLobby('room123');
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ roomName: 'room123' });
    });
  });

  describe('setPlayerBet', () => {
    it('should set a player bet in a lobby', async () => {
      await gameLobbyStore.setPlayerBet('room123', 'user1', 100);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { roomName: 'room123' },
        { $set: { 'players.user1.bet': 100 } }
      );
    });
  });

  describe('getPlayerCount', () => {
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
    it('should close the database connection', async () => {
      await gameLobbyStore.close();
      expect(mockClient.close).toHaveBeenCalled();
    });
  });
});
