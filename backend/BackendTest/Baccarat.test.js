const Baccarat = require('../GameManager/Baccarat');

jest.mock('mongodb', () => {
  const mClient = {
    connect: jest.fn().mockImplementation(() => Promise.resolve()), // Mock promise that resolves to undefined
    db: jest.fn().mockReturnThis(),
    collection: jest.fn().mockReturnThis(),
    insertOne: jest.fn(),
    findOne: jest.fn().mockReturnValue(
      {
        lobbyId: 'abc123',
        gameType: 'baccarat',
        playerList: ["playera"],
        currentPlayerIndex: 0,
        currentTurn: 0,
        betsPlaced: {"playera": [{"betOnWhat":"1", "amount": 100}, {"betOnWhat":"red", "amount": 1}]},
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

let gameData;

describe('Baccarat', () => {
  beforeAll(() => {
  });

  afterAll(() => {
  });

  beforeEach(async ()=> {
    gameData = {
      lobbyId: 'abc123',
      gameType: 'baccarat',
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
    gameData = await Baccarat.newGame(gameData);
    console.log(gameData.gameItems);
  });

  afterEach(() => {
    
  });

  it('newGame', async () => {

    expect(gameData.gameItems.globalItems.pokar);
  });

  it('random', async () => {
    expect(typeof await Baccarat._getRandomCard(gameData) === "string");
  });
});