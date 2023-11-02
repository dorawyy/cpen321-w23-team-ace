const Blackjack = require('../GameManager/Blackjack');
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
        gameType: 'blackjack',
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

describe('Blackjack', () => {
  beforeAll(() => {
    // global setup
  });

  afterAll(() => {
    // global tear down
  });

  beforeEach(async ()=> {
    // per test setup
    gameData = {
      lobbyId: 'abc123',
      gameType: 'Blackjack',
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
    gameData = await Blackjack.newGame(gameData);
  });

  afterEach(() => {
    // per test tear down
    
  });

  it('newGame', async () => {
    expect(gameData.gameItems.globalItems.pokar);
  });

  it('random', async () => {
    
    let randomCard = await Blackjack._getRandomCard(gameData)
    console.log(randomCard);
    expect(typeof randomCard === "string");
    expect(randomCard.length >= 2);
  });
  // Add more tests as needed
});