const { mock } = require('node:test');
const Roulette = require('../GameManager/Roulette');
const GameAssets = require('../GameManager/GameAssets');
jest.mock('mongodb', () => {
  const mClient = {
    connect: jest.fn().mockImplementation(() => Promise.resolve()), // Mock promise that resolves to undefined
    db: jest.fn().mockReturnThis(),
    collection: jest.fn().mockReturnThis(),
    insertOne: jest.fn(),
    findOne: jest.fn().mockReturnValue(
      {}
    ),
    updateOne: jest.fn()
  }
  return { MongoClient: jest.fn(() => mClient) };
});

let callCount = 0;
let returnVal = [1*4];
global.fetch = jest.fn().mockImplementation( () =>{
  return Promise.resolve({
    json: () => {
      callCount++;
      return Promise.resolve({
        "result": {
          "random": {
            "data": [returnVal[callCount - 1] - 4]
          }
        }
      }); 
    },
  })
})

let gameData;

describe('Roulette', () => {
  beforeAll(() => {
  });

  afterAll(() => {
  });

  beforeEach(async ()=> {
    gameData = {
      lobbyId: 'abc123',
      gameType: 'Roulette',
      playerList: ["playera"],
      currentPlayerIndex: 0,
      currentTurn: 0,
      betsPlaced: {"playera": [{"betOnWhat":"1", "amount": 100}, {"betOnWhat":"red", "amount": 1}]},
      gameItems: {
          globalItems: {}, 
          playerItems: {}
      },
      actionHistory: []
    }
    gameData = await Roulette.newGame(gameData);
    //await new Promise(resolve => setTimeout(resolve, 500));
  });

  afterEach(() => {
    global.fetch.mockClear();
  });

  it('newGame', async () => {
    expect(gameData.gameItems.globalItems.rouletteTable).toStrictEqual(GameAssets.getRoulette());
  });

  it('one game', async () => {
    callCount = 0;
    returnVal = [1*4, 1*4, 1*4, 1*4, 1*4, 1*4];
    // more like init
    let gameDataLocal = await Roulette.playTurn(gameData);
    expect(typeof gameDataLocal).toBe("object");
    expect(gameDataLocal.currentPlayerIndex).toBe(-1);
  });

  it('calculate correct double lose', async () => {
    callCount = 0;
    returnVal = [1*4, 1*4, 1*4, 1*4, 1*4, 1*4, 10*4, 10*4, 10*4];
    
    let gameDataLocal = await Roulette.playTurn(gameData);
    expect(typeof gameDataLocal).toBe("object");
    expect(gameDataLocal.currentPlayerIndex).toBe(-1);
    let gameResult = await Roulette.calculateWinning(gameDataLocal)
    expect(gameResult != 0).toBe(true);    
    expect(gameResult.playera).toBe(0);
  });


  it('calculate correct double win', async () => {
    callCount = 0;
    returnVal = [1];
    
    let gameDataLocal = await Roulette.playTurn(gameData);
    expect(typeof gameDataLocal).toBe("object");
    expect(gameDataLocal.currentPlayerIndex).toBe(-1);
    let gameResult = await Roulette.calculateWinning(gameDataLocal)
    expect(gameResult != 0).toBe(true);    
    expect(gameResult.playera).toBe(100);
  });

  it('calculate all possible win', async () => {
    callCount = 0;
    returnVal = [36];
    //0-36
    for(let i = 0; i <= 36; i++){
      // interate through bet type: red, black, odd, even, low, high, firstDozen, secondDozen, thirdDozen, 
      //firstColumn, secondColumn, thirdColumn, {single numbers like 0, 1, 2...}
      betTypes = ["red", "black", "odd", "even", "green", "low", "high", "firstDozen", 
        "secondDozen", "thirdDozen", "firstColumn", "secondColumn", "thirdColumn", 
        i.toString(), (i-1).toString()];
      callCount = 0;
      returnVal = [i];
      for(let j = 0; j < betTypes.length; j++){
        gameData.betsPlaced.playera[0].betOnWhat = betTypes[j];
        // force a turn even with -1
        let gameDataLocal = await Roulette.playTurn(gameData);
        expect(typeof gameDataLocal).toBe("object");
        expect(gameDataLocal.currentPlayerIndex).toBe(-1);
        let gameResult = await Roulette.calculateWinning(gameDataLocal)
        expect(gameResult != 0).toBe(true);    
        expect(typeof gameResult.playera).toBe("number");
      }
    }
    
  });


  it('Calculate winning before gameover', async () => {
    
    callCount = 0;
    returnVal = [5*4, 4*4, 1*4, 2*4, 2*4, 2*4, 10*4];

    let gameDataLocal = await Roulette.calculateWinning(gameData)
    expect(gameDataLocal).toBe(0);
  });
});