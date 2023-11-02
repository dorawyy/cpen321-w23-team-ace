const GameManager = require('../GameManager/Roulette');
const Roulette = require('../GameManager/Roulette');
const ioMock = {
  to: jest.fn().mockImplementation(() => {
      return {
          emit: jest.fn((event, data) => {
              console.log(event, data);
          })
      };
  })
};  // jest's jest.fn() method returns a new mock function

jest.mock('mongodb', () => {
  const mClient = {
    connect: jest.fn().mockImplementation(() => Promise.resolve()), // Mock promise that resolves to undefined
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

describe('Roulette', () => {
  beforeAll(() => {
    // global setup
  });

  afterAll(() => {
    // global tear down
  });

  beforeEach(() => {
    // per test setup
  });

  afterEach(() => {
    // per test tear down
  });

  it('random', async() => {
  });
  // Add more tests as needed
});