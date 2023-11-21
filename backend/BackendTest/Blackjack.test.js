const { mock } = require('node:test');
const Blackjack = require('../GameManager/Blackjack');
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
//mock random.org
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

describe('Blackjack', () => {
  beforeAll(() => {
  });

  afterAll(() => {
  });

  beforeEach(async ()=> {
    gameData = {
      lobbyId: 'abc123',
      gameType: 'Blackjack',
      playerList: ["playera"],
      currentPlayerIndex: 0,
      currentTurn: 0,
      betsPlaced: {"playera": 100},
      gameItems: {
          globalItems: {}, 
          playerItems: {}
      },
      actionHistory: []
    }
    gameData = await Blackjack.newGame(gameData);
    //await new Promise(resolve => setTimeout(resolve, 500));
  });

  afterEach(() => {
    global.fetch.mockClear();
  });

  /* ensure that the game is initialized properly */
  //chatGPT usage: No
  it('newGame', async () => {
    expect(gameData.gameItems.globalItems.pokar).toStrictEqual(GameAssets.getPokar());
  });

  /* return a random card */
  //chatGPT usage: No
  it('random card', async () => {
    callCount = 0;
    returnVal = [1*4];
    card = await Blackjack._getRandomCard(gameData);
    expect(typeof card).toBe("string");
    expect(card).toContain("A");

  });

  /*make sure one round of the game is played properly */
  //chatGPT usage: No
  it('one round', async () => {
    callCount = 0;
    returnVal = [1*4, 1*4, 1*4, 1*4, 1*4, 1*4];
    // more like init
    let gameDataLocal = await Blackjack.playTurn(gameData, "playera", "hit");
    expect(typeof gameDataLocal).toBe("object");
    expect(gameDataLocal.currentPlayerIndex).toBe(0);
    expect(gameDataLocal.gameItems.playerItems.playera.playerHand[0]).toContain("A");
  });

  /*make sure >=21 of the game is played properly */
  //chatGPT usage: No
  it('Repeat hit until blow', async () => {
    callCount = 0;
    returnVal = [10*4, 5*4, 3*4, 3*4, 3*4, 3*10, 3*10, 3*10, 3*10];
    
    let gameDataLocal = await Blackjack.playTurn(gameData, "playera", "hit");
    gameDataLocal = await Blackjack.playTurn(gameDataLocal, "playera", "hit");
    gameDataLocal = await Blackjack.playTurn(gameDataLocal, "playera", "hit");
    gameDataLocal = await Blackjack.playTurn(gameDataLocal, "playera", "hit");
    gameDataLocal = await Blackjack.playTurn(gameDataLocal, "playera", "hit");
    expect(typeof gameDataLocal).toBe("object");
    expect(gameDataLocal.currentPlayerIndex).toBe(-1);
    
    expect(gameDataLocal.gameItems.playerItems.playera.playerHand[0]).toContain("10");
  });

  /*make sure stand of the game is handled properly */
  //chatGPT usage: No
  it('stand win', async () => {
    callCount = 0;
    returnVal = [1*4, 1*4, 1*4, 1*4, 1*4, 1*4, 10*4, 10*4, 10*4];
    
    let gameDataLocal = await Blackjack.playTurn(gameData, "playera", "stand");
    gameDataLocal = await Blackjack.playTurn(gameDataLocal, "playera", "stand");
    expect(typeof gameDataLocal).toBe("object");
    expect(gameDataLocal.currentPlayerIndex).toBe(-1);
    expect(gameDataLocal.gameItems.playerItems.playera.playerHand[0]).toContain("A");
    let gameResult = await Blackjack.calculateWinning(gameDataLocal)
    expect(gameResult != 0).toBe(true);    
    expect(gameResult.playera).toBe(100);
  });

  /*make sure stand of the game is handled properly */
  //chatGPT usage: No
  it('stand tie', async () => {
    callCount = 0;
    returnVal = [1*4, 10*4, 1*4, 10*4, 10*4, 10*4, 10*4, 10*4];
    
    let gameDataLocal = await Blackjack.playTurn(gameData, "playera", "stand");
    gameDataLocal = await Blackjack.playTurn(gameDataLocal, "playera", "stand");
    expect(typeof gameDataLocal).toBe("object");
    expect(gameDataLocal.currentPlayerIndex).toBe(-1);
    expect(gameDataLocal.gameItems.playerItems.playera.playerHand[0]).toContain("A");
    let gameResult = await Blackjack.calculateWinning(gameDataLocal)
    expect(gameResult != 0).toBe(true);    
    expect(gameResult.playera).toBe(0);
  });

  /*make sure hit then stand of the game is handled properly */
  //chatGPT usage: No
  it('hit stand lose', async () => {
    callCount = 0;
    returnVal = [9*4, 9*4, 1*4, 1*4, 10*4, 10*4, 10*4, 10*4, 10*4];
    
    let gameDataLocal = await Blackjack.playTurn(gameData, "playera", "stand");
    gameDataLocal = await Blackjack.playTurn(gameDataLocal, "playera", "hit");
    gameDataLocal = await Blackjack.playTurn(gameDataLocal, "playera", "stand");
    expect(typeof gameDataLocal).toBe("object");
    expect(gameDataLocal.currentPlayerIndex).toBe(-1);
    expect(gameDataLocal.gameItems.playerItems.playera.playerHand[0]).toContain("9");
    let gameResult = await Blackjack.calculateWinning(gameDataLocal)
    expect(gameResult != 0).toBe(true);    
    expect(gameResult.playera).toBe(-100);
  });

  /*make sure hit then stand of the game is handled properly */
  it('hit stand lose to blow', async () => {
    callCount = 0;
    returnVal = [10*4, 10*4, 10*4, 10*4, 10*4, 10*4, 10*4, 10*4, 10*4];
    
    let gameDataLocal = await Blackjack.playTurn(gameData, "playera", "stand");
    gameDataLocal = await Blackjack.playTurn(gameDataLocal, "playera", "hit");
    gameDataLocal = await Blackjack.playTurn(gameDataLocal, "playera", "stand");
    expect(typeof gameDataLocal).toBe("object");
    expect(gameDataLocal.currentPlayerIndex).toBe(-1);
    expect(gameDataLocal.gameItems.playerItems.playera.playerHand[0]).toContain("10");
    let gameResult = await Blackjack.calculateWinning(gameDataLocal)
    expect(gameResult != 0).toBe(true);    
    expect(gameResult.playera).toBe(-100);
  });

  /*make sure hit then stand of the game is handled properly */
  it('hit stand bj win', async () => {
    callCount = 0;
    returnVal = [10*4, 10*4, 1*4, 1*4, 9*4, 9*4, 10*4, 10*4, 10*4];
    
    let gameDataLocal = await Blackjack.playTurn(gameData, "none", "none"); //simulate start game call
    gameDataLocal = await Blackjack.playTurn(gameDataLocal, "playera", "hit");
    gameDataLocal = await Blackjack.playTurn(gameDataLocal, "playera", "stand");
    expect(typeof gameDataLocal).toBe("object");
    expect(gameDataLocal.currentPlayerIndex).toBe(-1);
    expect(gameDataLocal.gameItems.playerItems.playera.playerHand[0]).toContain("10");
    let gameResult = await Blackjack.calculateWinning(gameDataLocal)
    expect(gameResult != 0).toBe(true);    
    expect(gameResult.playera).toBe(150);
  });

  /*make sure one cannot calculate winning before gameover*/
  //chatGPT usage: No
  it('Calculate winning before gameover', async () => {
    
    callCount = 0;
    returnVal = [5*4, 4*4, 1*4, 2*4, 2*4, 2*4, 10*4];

    let gameDataLocal = await Blackjack.calculateWinning(gameData)
    expect(gameDataLocal).toBe(0);
  });

  /*cannot have undefined actions*/
  //chatGPT usage: No
  it('undefined action', async () => {
    
    callCount = 0;
    returnVal = [5*4, 4*4, 1*4, 2*4, 2*4, 2*4, 10*4];
    let gameDataLocal = await Blackjack.playTurn(gameData, "playera", "cry");
    gameDataLocal = await Blackjack.playTurn(gameDataLocal, "playera", "cry");
    expect(gameDataLocal.currentPlayerIndex).toBe(0);//no change
  });
});