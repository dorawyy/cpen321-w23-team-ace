const GameManager = require('../GameManager/GameManager');
const ioMock = {
  to: jest.fn().mockImplementation(() => {
      return {
          emit: jest.fn((event, data) => {
              console.log(event, data);
          })
      };
  })
}; 

jest.mock('mongodb', () => {
  const mClient = {
    connect: jest.fn().mockImplementation(() => Promise.resolve()), 
    db: jest.fn().mockReturnThis(),
    collection: jest.fn().mockReturnThis(),
    insertOne: jest.fn(),
    findOne: jest.fn().mockReturnValue(
      {
        lobbyId: 'abc123',
        gameType: 'roulette',
        playerList: ["playera"],
        currentPlayerIndex: 0,
        currentTurn: 0,
        betsPlaced: {"playera": [{"betOnWhat":"1", "amount": 100}, {"betOnWhat":"red", "amount": 1}]},
        gameItems: {
            globalItems: {"rouletteTable": [
              'green',
              'red',
              'black',
              'red',
              'black',
              'red',      // 5
              'black',
              'red',
              'black',
              'red',
              'black',    //10
              'black',
              'red',
              'black',
              'red',
              'black',
              'red',
              'black',
              'red',
              'red',
              'black',
              'red',
              'black',
              'red',
              'black',
              'red',
              'black',
              'red',
              'black',
              'black',
              'red',
              'black',
              'red',
              'black',
              'red',
              'black',
              'red'
          ]
          }, 
            playerItems: {}
        },
        actionHistory: []
      }
    ),
    updateOne: jest.fn()
  }
  return { MongoClient: jest.fn(() => mClient) };
});

var gameManager;

describe('GameManager', () => {
  beforeAll(() => {
  });

  afterAll(() => {
  });

  beforeEach(() => {
    gameManager = new GameManager(ioMock);
  });

  afterEach(() => {
  });

  it('should initialize the data structure correctly', () => {
    expect(gameManager).toBeInstanceOf(GameManager);
    expect(gameManager.io).toBe(ioMock);
    expect(gameManager.gameStore).toBeDefined();
    expect(gameManager.timers).toBeDefined();
  });

  it('should create a new game correctly', async () => {
    await gameManager.startGame('abc123', 'roulette', [], []);
    expect(gameManager.io.to).toHaveBeenCalledWith('abc123');
    expect(gameManager.io.to).toHaveBeenCalledWith('abc123');
  });

  it('should play a turn', async () => {
    await gameManager.playTurn('abc123', {"usera":[1]});
  });

});