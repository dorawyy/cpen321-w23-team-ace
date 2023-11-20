const { assert } = require('console');
const GameManager = require('../GameManager/GameManager');

jest.useFakeTimers()

const ioMock = {
  to: jest.fn().mockImplementation(() => {
      return {
          emit: jest.fn((event, data) => {
              return 0;
          })
      };
  })
}; 
let mockGameData = {};
jest.mock('mongodb', () => {
  const mDb = {
    collection: jest.fn(() => ({
      insertOne: (...args) => new Promise((resolve, reject) => {
        mockGameData = args[0];
        resolve({ insertedId: 'id123' });
      }),
      findOne: jest.fn(() => Promise.resolve(mockGameData)),
      updateOne:  (...args) => new Promise((resolve, reject) => {
        mockGameData = args[0];
        resolve({ insertedId: 'id123' });
      }),
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

global.fetch = jest.fn().mockImplementation( () =>{
  return Promise.resolve({
    json: () => {
      return Promise.resolve({
        "result": {
          "random": {
            "data": [1]
          }
        }
      }); 
    },
  })
})

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

  it('should handle db failing errors', () => {
    const mongoError = new Error('Cannot connect to MongoDB');
    const mClient = require('mongodb').MongoClient();
    mClient.connect.mockImplementationOnce(() => Promise.reject(mongoError));
    gameManagerBad = new GameManager(ioMock);
    gameManagerBad.connect();
    expect(gameManagerBad).toBeInstanceOf(GameManager);
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
            return 0;
          }),
        };
      }),
    };
  
    // then call your method
    await gameManager.startGame('abc123', 'Roulette', [], []);
    // Now you can console.log toParameters and emitParameters.
    expect(toParameters.length).toBe(1);
    expect(toParameters[0][0]).toEqual(expect.stringContaining('abc123'));
    expect(emitParameters[0][0]).toEqual(expect.stringContaining('gameOver'));
    expect(JSON.stringify(emitParameters[0][1])).toEqual(expect.stringContaining('abc123'));
  });

  it('play baccarat', async () => {
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        return {
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            return 0;
          }),
        };
      }),
    };
  
    // then call your method
    await gameManager.startGame('abc123', 'Baccarat', ["playera", "playerb"], {
      "playera": {"win":"PlayersWin", "amount": 100}, 
      "playerb": {"win":"BankerWin", "amount": 100}
    });
    // Now you can console.log toParameters and emitParameters.
    expect(toParameters.length).toBe(1);
    expect(toParameters[0][0]).toEqual(expect.stringContaining('abc123'));
    expect(emitParameters[0][0]).toEqual(expect.stringContaining('gameOver'));
    expect(JSON.stringify(emitParameters[0][1])).toEqual(expect.stringContaining('abc123'));
  });

  it('play BlackJack', async () => {
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        return {
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            return 0;
          }),
        };
      }),
    };
    
    // then call your method
    await gameManager.startGame('abc123', 'BlackJack', ["playera", "playerb"], {"playera": 100, "playerb": 100});
    // Now you can console.log toParameters and emitParameters.
    expect(toParameters.length).toBe(1);
    expect(toParameters[0][0]).toEqual(expect.stringContaining('abc123'));
    expect(emitParameters[0][0]).toEqual(expect.stringContaining('playerTurn'));
    expect(JSON.stringify(emitParameters[0][1])).toEqual(expect.stringContaining('abc123'));
    //stand
    await gameManager.playTurn('abc123', "playera", "stand");
    expect(toParameters.length).toBe(2);
    expect(toParameters[1][0]).toEqual(expect.stringContaining('abc123'));
    expect(emitParameters[1][0]).toEqual(expect.stringContaining('playerTurn'));
    expect(JSON.stringify(emitParameters[1][1])).toEqual(expect.stringContaining('abc123'));
    await gameManager.playTurn('abc123', "playerb", "stand");
    expect(toParameters.length).toBe(3);
    expect(toParameters[2][0]).toEqual(expect.stringContaining('abc123'));
    expect(emitParameters[2][0]).toEqual(expect.stringContaining('gameOver'));
    expect(JSON.stringify(emitParameters[2][1])).toEqual(expect.stringContaining('abc123'));
    // rest tested in BlackJack test
  });

  it('play roulette', async () => {
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        return {
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            return 0;
          }),
        };
      }),
    };
    
    // then call your method
    await gameManager.startGame('abc123', 'Roulette', ["playera", "playerb"], {
      "playera": {"red": 100, "black": 0, "odd": 0, "even": 0, "green": 0}, 
      "playerb": {"red": 0, "black": 100, "odd": 0, "even": 0, "green": 0}
    });
    
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
            return 0;
          }),
        };
      }),
    };
  
    // then call your method
    await gameManager.playTurn('abc123', {"usera":[1]});
    // Now you can console.log toParameters and emitParameters.
    expect(toParameters.length).toBe(1);
    expect(toParameters[0][0]).toEqual(expect.stringContaining('abc123'));
    expect(emitParameters[0][0]).toEqual(expect.stringContaining('gameOver'));
    expect(JSON.stringify(emitParameters[0][1])).toEqual(expect.stringContaining('abc123'));
  });

  it('Cannot calculate winning before gameover', async () => {
    let gameData = {
      "currentPlayerIndex": 0
    }
    gameResult = gameManager._calculateWinning(gameData);
    expect(gameResult).toBe(0);
  });

  it('_resetTimer should clear old and start a new timer', async () => {
    playTurnOrig = gameManager.playTurn;
    gameManager.playTurn = jest.fn();
    let gameData = {
      "currentPlayerIndex": 0,
      "playerList": ["playera"],
      "lobbyId": "abc123"
    }
      // first call to _resetTimer
      gameManager._resetTimer(gameData);

      // second call to _resetTimer to reset the timer
      gameManager._resetTimer(gameData);
      jest.runAllTimers();
  });

  it('_resetTimer should call playTurn after 15 seconds', async () => {
    playTurnOrig = gameManager.playTurn;
    gameManager.playTurn = jest.fn();
    let gameData = {
      "currentPlayerIndex": 0,
      "playerList": ["playera"],
      "lobbyId": "abc123"
    }
    gameManager._resetTimer(gameData);
    jest.runAllTimers();
    // at 0.5 sec delay
    //await new Promise(resolve => setTimeout(resolve, 50));

    expect(gameManager.playTurn).toHaveBeenCalledTimes(1);
    gameManager.playTurn = playTurnOrig;
  });


  it('call on unknwon game', async () => {
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        return {
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            return 0;
          }),
        };
      }),
    };
    
    // then call your method
    await gameManager.startGame('abc123', 'vall', ["playera", "playerb"], {
      "playera": {"red": 100, "black": 0, "odd": 0, "even": 0, "green": 0}, 
      "playerb": {"red": 0, "black": 100, "odd": 0, "even": 0, "green": 0}
    });
    expect(toParameters.length).toBe(0);
  });

});