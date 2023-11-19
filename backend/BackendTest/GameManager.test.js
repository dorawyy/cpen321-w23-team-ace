const { assert } = require('console');
const GameManager = require('../GameManager/GameManager');
const ioMock = {
  to: jest.fn().mockImplementation(() => {
      return {
          emit: jest.fn((event, data) => {
              console.log("fake emit:", event, data);
              return 0;
          })
      };
  })
}; 

jest.mock('mongodb', () => {
  const mDb = {
    collection: jest.fn(() => ({
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'id123' }),
      findOne: jest.fn().mockReturnValue({
          lobbyId: 'abc123',
          gameType: 'Roulette',
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
            ],
            "ballLocation": null, 
            }, 
              playerItems: {}
          },
          actionHistory: []
      }),
      updateOne: jest.fn(),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    })),
  };

  const mClient = {
    connect: jest.fn().mockResolvedValueOnce(this),
    close: jest.fn().mockResolvedValueOnce(),
    db: jest.fn().mockReturnValue(mDb),
  };

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
    gameManager.connect();
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
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        return {
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            console.log("fake emit:", args[1]);
            return 0;
          }),
        };
      }),
    };
  
    // then call your method
    await gameManager.startGame('abc123', 'Roulette', [], []);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Now you can console.log toParameters and emitParameters.
    expect(toParameters.length).toBe(1);
    expect(toParameters[0][0]).toEqual(expect.stringContaining('abc123'));
    expect(emitParameters[0][0]).toEqual(expect.stringContaining('gameOver'));
    expect(JSON.stringify(emitParameters[0][1])).toEqual(expect.stringContaining('abc123'));
  });

  it('should be able to game over', async () => {
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        return {
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            console.log("fake emit:", args[1]);
            return 0;
          }),
        };
      }),
    };
  
    // then call your method
    await gameManager.playTurn('abc123', {"usera":[1]});
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Now you can console.log toParameters and emitParameters.
    expect(toParameters.length).toBe(1);
    expect(toParameters[0][0]).toEqual(expect.stringContaining('abc123'));
    expect(emitParameters[0][0]).toEqual(expect.stringContaining('gameOver'));
    expect(JSON.stringify(emitParameters[0][1])).toEqual(expect.stringContaining('abc123'));
  });

});