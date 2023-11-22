const { mock } = require('node:test');
const Baccarat = require('../GameManager/Baccarat');
const GameAssets = require('../GameManager/GameAssets');
const gameAssets = require('../GameManager/GameAssets');
jest.mock('mongodb', () => {
  const mClient = {
    connect: jest.fn().mockImplementation(() => Promise.resolve()), // Mock promise that resolves to undefined
    db: jest.fn().mockReturnThis(),
    collection: jest.fn().mockReturnThis(),
    insertOne: jest.fn(),
    findOne: jest.fn().mockReturnValue(
      {
        lobbyId: 'abc123',
        gameType: 'Baccarat',
        playerList: ["playera"],
        currentPlayerIndex: 0,
        currentTurn: 0,
        betsPlaced: {"playera": {"win":"PlayersWin", "amount": 100}},
        gameItems: {
            globalItems: {
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

let callCount = 0;
let returnVal = [1*4];
global.fetch = jest.fn().mockImplementation( () =>{
  return Promise.resolve({
    json: () => {
      callCount++;
      return Promise.resolve({
        "result": {
          "random": {
            "data": [returnVal[callCount - 1]]
          }
        }
      }); 
    },
  })
})

let gameData;

describe('GameAsset', () => {
  beforeAll(() => {
  });

  afterAll(() => {
  });

  beforeEach(async ()=> {
    gameData = {
      lobbyId: 'abc123',
      gameType: 'Baccarat',
      playerList: ["playera"],
      currentPlayerIndex: 0,
      currentTurn: 0,
      betsPlaced: {"playera": {"win":"PlayersWin", "amount": 100}},
      gameItems: {
          globalItems: {}, 
          playerItems: {}
      },
      actionHistory: []
    }
    gameData = await Baccarat.newGame(gameData);
  });

  afterEach(() => {
    global.fetch.mockClear();
  });

  /*make sure a card set with pokar is covered*/
  // input: pokar
  //expected behavior: pokar set can include joker
  // expected output: joker is in set and == value 100, 101
  // chatGPT usage: No
  it('jokar pokar', async () => {
    let pokar = gameAssets.getPokar(true);
    expect(pokar[52]).toContain("bigJoker");
    expect(pokar[53]).toContain("smallJoker");
    value = gameAssets.getPokarFaceValue(pokar[52]);
    expect(value).toBe(101);
    value = gameAssets.getPokarFaceValue(pokar[53]);
    expect(value).toBe(100);
  });

  /*make sure special value card can be interpretaed*/
  // input: card
  // expected behavior: card value is interpreted correctly
  // expected output: card value is correct
  // chatGPT usage: No
  it('special pokar', async () => {
    let value = gameAssets.getPokarFaceValue("AH");
    expect(value).toBe(1);
    value = gameAssets.getPokarFaceValue("JH");
    expect(value).toBe(11);
    value = gameAssets.getPokarFaceValue("QH");
    expect(value).toBe(12);
    value = gameAssets.getPokarFaceValue("KH");
    expect(value).toBe(13);
  });

  /* attempt to get random number*/
  // input: min, max, count
  // expected behavior: random number is generated
  // expected output: random number is generated
  // chatGPT usage: No
  it('get random number', async () => {
    callCount = 0;
    returnVal = [1];
    let value = await gameAssets.getRandomNumber(1, 10, 1);
    expect(value).toStrictEqual([1]);
  });

  /* attempt to get random number with negative count*/
  // input: min, max, count 9<0)
  // expected behavior: random number is generated
  // expected output: random number is generated
  // chatGPT usage: No
  it('get random number but negative count', async () => {
    callCount = 0;
    returnVal = [1];
    let value = await gameAssets.getRandomNumber(1, 10, -11);
    expect(value).toStrictEqual([1]);
  });

  /* attempt to get random number with invalid response*/
  // input: min, max, count
  // expected behavior: random number is generated when return mode to disallow value
  // expected output: random number is generated
  // chatGPT usage: No
  it('get random number no valid response', async () => {
    callCount = 0;
    returnVal = ["k"];
    let value = await gameAssets.getRandomNumber(1, 10, 1);
    // should use math
    expect(typeof value[0]).toStrictEqual("number");
  });

});