const GameManager = require('../GameManager/GameManager');
const mongoShield = require('../mongoShield');

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

// attempts to mock mongodb
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
        mockGameData = args[1].$set;
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

  let return_client = {MongoClient: jest.fn(() => mClient)}

  return return_client;
});

//mock random.org
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

// ChatGPT usage: No
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

  // Input: ioMock
  // Expected behavior: GameManager is initialized with the correct data structure
  // Expected output: GameManager object is created
  // ChatGPT usage: No
  it('should initialize the data structure correctly', () => {
    expect(gameManager).toBeInstanceOf(GameManager);
    expect(gameManager.io).toBe(ioMock);
    expect(gameManager.gameStore).toBeDefined();
    expect(gameManager.timers).toBeDefined();
  });

  // Input: none
  // Expected behavior: should be able to handle db connection errors
  // Expected output: GameManager object is created, yet db connection is not established
  // ChatGPT usage: No
  it('should handle db failing errors', () => {
    const mongoError = new Error('Cannot connect to MongoDB');
    const mClient = require('mongodb').MongoClient();
    mClient.connect.mockImplementationOnce(() => Promise.reject(mongoError));
    let gameManagerBad = new GameManager(ioMock);
    gameManagerBad.connect();
    expect(gameManagerBad).toBeInstanceOf(GameManager);
    expect(gameManagerBad.io).toBe(ioMock);
    expect(gameManagerBad.gameStore).toBeDefined();
  });

  // Input: none
  // Expected behavior: Should be able to create a new game
  // Expected output: GameManager object is created and gameover called as type is roulette
  // ChatGPT usage: No
  it('should create a new game correctly', async () => {
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        let emit = {
          // mock incomming emit, track calling parameters
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            return 0;
          }),
        };
        return emit
      }),
    };
  
    await gameManager.startGame('abc123', 'Roulette', [], []);
    expect(toParameters.length).toBe(1);
    expect(toParameters[0][0]).toEqual(expect.stringContaining('abc123'));
    expect(emitParameters[0][0]).toEqual(expect.stringContaining('gameOver'));
    expect(JSON.stringify(emitParameters[0][1])).toEqual(expect.stringContaining('abc123'));
  });

  // Input: none
  // Expected behavior: can play Baccarat
  // Expected output: gameover called
  // ChatGPT usage: No
  it('play baccarat', async () => {
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        // codacy resolve blocking
        let emit = {
          // mock incomming emit, track calling parameters
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            return 0;
          }),
        };
        return emit
      }),
    };
  
    
    await gameManager.startGame('abc123', 'Baccarat', ["playera", "playerb"], {
      "playera": {"win":"PlayersWin", "amount": 100}, 
      "playerb": {"win":"BankerWin", "amount": 100}
    });
    
    expect(toParameters.length).toBe(1);
    expect(toParameters[0][0]).toEqual(expect.stringContaining('abc123'));
    expect(emitParameters[0][0]).toEqual(expect.stringContaining('gameOver'));
    expect(JSON.stringify(emitParameters[0][1])).toEqual(expect.stringContaining('abc123'));
  });

  // Input: none
  // Expected behavior: should be able to playturn the blackjack
  // Expected output: gameover called
  // ChatGPT usage: No
  it('play BlackJack', async () => {
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        let emit = {
          // mock incomming emit, track calling parameters
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            return 0;
          }),
        };
        return emit
      }),
    };
    
    
    await gameManager.startGame('abc123', 'BlackJack', ["playera", "playerb"], {"playera": 100, "playerb": 100});
    
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

  // Input: none
  // Expected behavior: should be able to playturn the roulette
  // Expected output: gameover called
  // ChatGPT usage: No
  it('play roulette', async () => {
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        let emit = {
          // mock incomming emit, track calling parameters
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            return 0;
          }),
        };
        return emit
      }),
    };
    
    
    await gameManager.startGame('abc123', 'Roulette', ["playera", "playerb"], {
      "playera": {"red": 100, "black": 0, "odd": 0, "even": 0, "green": 0}, 
      "playerb": {"red": 0, "black": 100, "odd": 0, "even": 0, "green": 0}
    });
    
    
    expect(toParameters.length).toBe(1);
    expect(toParameters[0][0]).toEqual(expect.stringContaining('abc123'));
    expect(emitParameters[0][0]).toEqual(expect.stringContaining('gameOver'));
    expect(JSON.stringify(emitParameters[0][1])).toEqual(expect.stringContaining('abc123'));
  });

  // Input: none
  // Expected behavior: should be able to playturn the gameover
  // Expected output: gameover called
  // ChatGPT usage: No
  it('should be able to game over', async () => {
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        let emit = {
          // mock incomming emit, track calling parameters
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            return 0;
          }),
        };
        return emit
      }),
    };
    await gameManager.startGame('abc123', 'Roulette', ["playera", "playerb"], {
      "playera": {"red": 100, "black": 0, "odd": 0, "even": 0, "green": 0}, 
      "playerb": {"red": 0, "black": 100, "odd": 0, "even": 0, "green": 0}
    });
    
    await gameManager.playTurn('abc123', {"usera":[1]});
    
    expect(toParameters[0][0]).toEqual(expect.stringContaining('abc123'));
    expect(emitParameters[0][0]).toEqual(expect.stringContaining('gameOver'));
    expect(JSON.stringify(emitParameters[0][1])).toEqual(expect.stringContaining('abc123'));
  });

  // Input: none
  // Expected behavior: should be able to playturn, but not with blackjack
  // Expected output: gameover called
  // ChatGPT usage: No
  it('playturn, but not with blackjack', async () => {
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        let emit = {
          // mock incomming emit, track calling parameters
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            return 0;
          }),
        };
        return emit
      }),
    };
    await gameManager.startGame('abc123', 'Roulette', ["playera", "playerb"], {
      "playera": {"red": 100, "black": 0, "odd": 0, "even": 0, "green": 0}, 
      "playerb": {"red": 0, "black": 100, "odd": 0, "even": 0, "green": 0}
    });
    mockGameData.currentPlayerIndex = 1;
    mockGameData.gameType = "Not BlackJack";
    
    await gameManager.playTurn('abc123', {"usera":[1]});
    
    expect(toParameters[0][0]).toEqual(expect.stringContaining('abc123'));
    expect(emitParameters[0][0]).toEqual(expect.stringContaining('gameOver'));
    expect(emitParameters[1][0]).toEqual(expect.stringContaining('playerTurn'));
    expect(JSON.stringify(emitParameters[0][1])).toEqual(expect.stringContaining('abc123'));
  });

  // Input: none
  // Expected behavior: should not be able to calculate winning before gameover
  // Expected output: gameResult to be 0
  // ChatGPT usage: No
  it('Cannot calculate winning before gameover', async () => {
    let gameData = {
      "currentPlayerIndex": 0
    }
    let gameResult = gameManager._calculateWinning(gameData);
    expect(gameResult).toBe(0);
  });

  // Input: none
  // Expected behavior: _resetTimer should clear old and start a new timer
  // Expected output: playturn tobe called
  // ChatGPT usage: No
  it('_resetTimer should clear old and start a new timer', async () => {
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
      // should reset
      expect(gameManager.playTurn).toHaveBeenCalledTimes(1);
  });

  // Input: none
  // Expected behavior: playTurn should be called after 15 seconds
  // Expected output: playturn tobe called
  // ChatGPT usage: No
  it('_resetTimer should call playTurn after 15 seconds', async () => {
    let playTurnOrig = gameManager.playTurn;
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

  // Input: none
  // Expected behavior: get action result type undefined
  // Expected output: call from gameOver
  // ChatGPT usage: No
  it('get action result type undefined', async () => {
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        let emit = {
          // mock incomming emit, track calling parameters
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            return 0;
          }),
        };
        return emit
      }),
    };
  
    await gameManager.startGame('abc123', 'vall', ["playera", "playerb"], {
      "playera": {"red": 100, "black": 0, "odd": 0, "even": 0, "green": 0}, 
      "playerb": {"red": 0, "black": 100, "odd": 0, "even": 0, "green": 0}
    });
    // make local copy
    let gameDataTemp = JSON.parse(JSON.stringify(mockGameData)); 
    gameDataTemp.gameType = "unknown";
    gameManager._getActionResult(gameDataTemp, "?", "Cry");
    expect(toParameters.length).toBe(0);
  });

  // Input: none
  // Expected behavior: get calculation type undefined
  // Expected output: call from gameOver
  // ChatGPT usage: No
  it('get calculation type undefined', async () => {
    let toParameters = [];
    let emitParameters = [];
    gameManager.io = {
      to: jest.fn((...args) => {
        toParameters.push(args);
        let emit = {
          // mock incomming emit, track calling parameters
          emit: jest.fn((...args) => {
            emitParameters.push(args);
            return 0;
          }),
        };
        return emit
      }),
    };
  
    await gameManager.startGame('abc123', 'Roulette', ["playera", "playerb"], {
      "playera": {"red": 100, "black": 0, "odd": 0, "even": 0, "green": 0}, 
      "playerb": {"red": 0, "black": 100, "odd": 0, "even": 0, "green": 0}
    });
    // make local copy
    let gameDataTemp = JSON.parse(JSON.stringify(mockGameData)); 
    gameDataTemp.gameType = "unknown";
    gameManager._calculateWinning(gameDataTemp);
    expect(toParameters.length).toBe(1); // call from gameOver
  });

  // Test malicious gameData
  // Input: none
  // Expected behavior: bad input not used to db
  // Expected output: 0
  // ChatGPT usage: No
  it('should throw an error if malicious gameData is used', async () => {
    let gameStore = gameManager.gameStore;
    expect (await gameStore.newGame('$ne')).toBe(0); // Inserting a potential malicious object
  });

  // Test malicious lobbyName in getGame 
  // Input: none
  // Expected behavior: bad input not used to db
  // Expected output: 0
  // ChatGPT usage: No
  it('should throw an error if malicious lobbyName is used in getGame', async () => {
    let gameStore = gameManager.gameStore;
    expect (await gameStore.getGame({$ne: null})).toBe(0); 
  });

  // Test malicious gameData in updateGame 
  // Input: none
  // Expected behavior: bad input not used to db
  // Expected output: 0
  // ChatGPT usage: No
  it('should throw an error if malicious gameData is used in updateGame', async () => {
    let gameStore = gameManager.gameStore;
    expect (await gameStore.updateGame('$ne')).toBe(0); // Inserting a potential malicious object
  });

  // Test malicious lobbyName in deleteGame 
  // Input: none
  // Expected behavior: bad input not used to db
  // Expected output: 0
  // ChatGPT usage: No
  it('should throw an error if malicious lobbyName is used in deleteGame', async () => {
    let gameStore = gameManager.gameStore;
    expect (await gameStore.deleteGame({$ne: null})).toBe(0); 
  });

  // Test malicious lobbyName in deleteGame 
  // Input: none
  // Expected behavior: bad input not used to db
  // Expected output: 0
  // ChatGPT usage: No
  it('should throw an error if malicious lobbyName is used in deleteGame bad type', async () => {
    let gameStore = gameManager.gameStore;
    expect (await gameStore.deleteGame('$one')).toBe(0); 
  });

  // small mongo shield test for success
  // Input: none
  // Expected behavior: mongo db should success if input type is list
  // Expected output: 0
  // ChatGPT usage: No
  it('should return true if type test match', async () => {
    expect(mongoShield("hi", ['string'])).toBe(true);
  });

  
  // Test Query selector in get game
  // Input: none
  // Expected behavior: bad input not used to db
  // Expected output: 0
  // ChatGPT usage: No
  it('error with query selector', async () => {
    let meanInput = {
      "user.profile": {
        $elemMatch: {
          role: { $eq: "admin" }
        }
      }
    }
    expect (await mongoShield(meanInput)).toBe(false); 
  });

  // Test operator inject in get game
  // Input: none
  // Expected behavior: bad input not used to db
  // Expected output: 0
  // ChatGPT usage: No
  it('error with opertor', async () => {
    let meanInput = {
      $where: "this.username === 'admin' && this.password.length > 0"
    };
    expect (await mongoShield(meanInput)).toBe(false); 
  });

  // Test double opertor
  // Input: none
  // Expected behavior: bad input not used to db
  // Expected output: 0
  // ChatGPT usage: No
  it('error with double operator inject', async () => {
    let meanInput = {
      "user.profile": {
        $elemMatch: {
          role: { $eq: "admin" }
        }
      }
    };
    expect (await mongoShield(meanInput)).toBe(false); 
  });

   // Test code running
  // Input: none
  // Expected behavior: bad input not used to db
  // Expected output: 0
  // ChatGPT usage: No
  it('error with code injection', async () => {
    let meanInput = {
      $where: "function() { return true; }"
    };
    expect (await mongoShield(meanInput)).toBe(false); 
  });

   // small mongo shield test
  // Input: none
  // Expected behavior: mongo db should success if deafult types
  // Expected output: 0
  // ChatGPT usage: No
  it('should handle default param', async () => {
    expect(mongoShield("hi")).toBe(true);
  });
});