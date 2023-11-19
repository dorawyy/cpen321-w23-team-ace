
const Roulette = require('../GameManager/Roulette');

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
            globalItems: {},
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

describe('Roulette', () => {
  beforeAll(() => {
  });

  afterAll(() => {
  });

  beforeEach(async () => {
    gameData = {
      lobbyId: 'abc123',
      gameType: 'roulette',
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
    console.log(gameData.gameItems);
  });

  afterEach(() => {
  });

  it('random', async() => {
  });
});