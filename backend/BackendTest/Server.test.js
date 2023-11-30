const { Server } = require("socket.io");
const Client = require("socket.io-client");
const { mockInstances } = require('mongodb');
const { app } = require('../server'); // assuming that your server file is named server.js
let io, clientSocket;

// this mock is needed for github
// setting up memory DB do not work for github action due to memory limit
// it is also not possible to install full db to github action
// hence, we mock basic db functionality, one can remove this mock for local testing
// it only applies to github and server testing
jest.mock('mongodb', () => {
    const mockFindOne = jest.fn();
    const mockFind = jest.fn().mockReturnThis();
    const mocktoArray = jest.fn();
    const mockInsertOne = jest.fn();
    const mockUpdateOne = jest.fn();
    const mockDeleteOne = jest.fn();
    const mockDeleteMany = jest.fn();
  
    const mClient = {
      connect: jest.fn().mockResolvedValue(null),
      db: jest.fn().mockReturnThis(),
      collection: jest.fn().mockReturnThis(),
      insertOne: mockInsertOne,
      find: mockFind,
      toArray: mocktoArray,
      findOne: mockFindOne,
      updateOne: mockUpdateOne,
      deleteOne: mockDeleteOne,
      deleteMany: mockDeleteMany,
      close: jest.fn().mockResolvedValue(null),
    };
  
    return { 
      MongoClient: jest.fn(() => mClient),
      mockInstances: {
        mockFindOne,
        mocktoArray,
        mockInsertOne,
        mockUpdateOne,
        mockDeleteOne,
        mockDeleteMany
      }
    };
  });

beforeAll((done) => {
    const httpServer = require('http').createServer(app);
    io = new Server(httpServer);
    httpServer.listen(() => {
        clientSocket = new Client(`http://localhost:8081`);
        io.on("connection", socket => {
            serverSocket = socket;
        });
        clientSocket.on("connect", done);
    });
});
  
afterAll(() => {
    io.close();
    clientSocket.close();
});
beforeEach(() => {
    // Reset the mocks before each test
    mockInstances.mockFindOne.mockReset();
    mockInstances.mocktoArray.mockReset();
    mockInstances.mockInsertOne.mockReset();
    mockInstances.mockUpdateOne.mockReset();
    mockInstances.mockDeleteOne.mockReset();
    mockInstances.mockDeleteMany.mockReset();
    clientSocket.off();
});

describe('retrieveAccount', () => {

    // ChatGPT usage: No
    // Input: userId
    // Expected behavior: Emit 'retrieveAccount' event
    // Expected output: None
    it('should emit userAccountDetails when retrieveAccount event is received', (done) => {
        const fakeUser = { userId: 'testUserID', username: 'testUser', balance: 100 };
        mockInstances.mockFindOne.mockResolvedValue(fakeUser);

        clientSocket.on('userAccountDetails', (data) => {
            console.log(fakeUser)
            expect(data).toEqual(fakeUser);
            done();
        });

        clientSocket.emit('retrieveAccount', fakeUser.userId);
    });

   
});

describe('updateAccount', () => {
    // ChatGPT usage: No
    // Input: userInfo
    // Expected behavior: Emit 'updateAccount' event
    // Expected output: None
    it('should trigger when client emits updateAccount event', (done) => {
        const fakeUser = { userId: 'testUserID', username: 'testUser', balance: 100 };
        mockInstances.mockUpdateOne.mockResolvedValue(fakeUser);
        mockInstances.mockFindOne.mockResolvedValue(fakeUser);

        clientSocket.on('accountUpdated', (data) => {
            console.log(fakeUser)
            expect(data).toEqual(fakeUser);
            done();
        });

        clientSocket.emit('updateAccount', fakeUser);
    });
});

describe('createAccount', () => {
    // ChatGPT usage: No
    // Input: userInfo
    // Expected behavior: Emit 'createAccount' event
    // Expected output: None
    it('should trigger when client emits createAccount event', (done) => {

        const fakeUser = { userId: 'testUserID', username: 'testUser', balance: 100 };
        mockInstances.mockInsertOne.mockResolvedValue(fakeUser);
        mockInstances.mockFindOne
        .mockImplementationOnce(() => Promise.resolve(null))
        .mockImplementationOnce(() => Promise.resolve(fakeUser))

        clientSocket.on('accountCreated', (data) => {
            console.log(fakeUser)
            expect(data).toEqual(fakeUser);
            done();
        });

        clientSocket.emit('createAccount', fakeUser);
    });
});

describe('updateName', () => {
    // ChatGPT usage: No
    // Input: userId, newName
    // Expected behavior: Emit 'updateName' event
    // Expected output: None
    it('should trigger when client emits updateName event', (done) => {
        var fakeUser = { userId: 'testUserID', username: 'testUser', balance: 100 };

        
        mockInstances.mockUpdateOne.mockResolvedValue(fakeUser); 
        
        mockInstances.mockFindOne.mockResolvedValue({ userId: 'testUserID', username: 'David', balance: 100 }); 

        clientSocket.on('accountUpdated', (data) => {
            expect(data.username).toBe('David');
            done();
        });

        clientSocket.emit('updateName', fakeUser.userId, "David");
    });
});

describe('updateAdminStatus', () => {
    // ChatGPT usage: No
    // Input: username, adminStatus
    // Expected behavior: Emit 'updateAdminStatus' event
    // Expected output: None
    it('should trigger when client emits updateAdminStatus event', (done) => {
        var fakeUser = { userId: 'testUserID', username: 'testUser', isAdmin: false };
        mockInstances.mockUpdateOne.mockResolvedValue(fakeUser);
        fakeUser.isAdmin = true;
        mockInstances.mockFindOne.mockResolvedValue(fakeUser);

        clientSocket.on('accountUpdated', (data) => {
            console.log(fakeUser)
            expect(data).toEqual(fakeUser);
            done();
        });

        clientSocket.emit('updateAdminStatus', fakeUser.username, true);
    });
});

describe('deposit', () => {
    // ChatGPT usage: No
    // Input: userId, amount
    // Expected behavior: Emit 'deposit' event
    // Expected output: None
    it('should trigger when client emits deposit event', (done) => {
        const fakeUser = { userId: 'testUserID', username: 'testUser', balance: 100 };
        fakeUser.balance += 100;
        mockInstances.mockUpdateOne.mockResolvedValue(fakeUser);
        mockInstances.mockFindOne.mockResolvedValue(fakeUser);

        clientSocket.on('balanceUpdate', (data) => {
            expect(data).toEqual(fakeUser.balance);
            done();
        });

        clientSocket.emit('deposit', fakeUser.userId, 100);
    });
});

describe('changebalancebyname', () => {
    // ChatGPT usage: No
    // Input: username, amount
    // Expected behavior: Emit 'changebalancebyname' event
    // Expected output: None
    it('should trigger when client emits changebalancebyname event', (done) => {
        const fakeUser = { userId: 'testUserID', username: 'testUser', balance: 100 };
        fakeUser.balance += 100;
        mockInstances.mockUpdateOne.mockResolvedValue(fakeUser);
        mockInstances.mockFindOne.mockResolvedValue(fakeUser);

        clientSocket.on('balanceUpdate', (data) => {
            console.log(fakeUser)
            expect(data).toEqual(fakeUser.balance);
            done();
        });

        clientSocket.emit('changebalancebyname', fakeUser.username, 100);
    });
});

describe('withdraw', () => {
    // ChatGPT usage: No
    // Input: userId, amount
    // Expected behavior: Emit 'withdraw' event
    // Expected output: None
    it('should trigger when client emits withdraw event', (done) => {
        const fakeUser = { userId: 'testUserID', username: 'testUser', balance: 100 };
        mockInstances.mockUpdateOne.mockResolvedValue(fakeUser);
        mockInstances.mockFindOne
        .mockImplementationOnce(() => Promise.resolve({...fakeUser, balance: 100 }))
        .mockImplementationOnce(() => Promise.resolve({...fakeUser, balance: 0 }))
       

        clientSocket.on('balanceUpdate', (data) => {
            console.log(fakeUser)
            fakeUser.balance -= 100;
            expect(data).toEqual(fakeUser.balance);
            done();
        });

        clientSocket.emit('withdraw', fakeUser.username, 100);
    });
});


describe('updateChatBanned', () => {
    // ChatGPT usage: No
    // Input: username, chatBannedStatus
    // Expected behavior: Emit 'updateChatBanned' event
    // Expected output: None
    it('should trigger when client emits updateChatBanned event', (done) => {
        const fakeUser = { userId: 'testUserID', username: 'testUser', chatBannedstatus: false };
        fakeUser.chatBannedstatus = true;
        mockInstances.mockUpdateOne.mockResolvedValue(fakeUser);
        mockInstances.mockFindOne.mockResolvedValue(fakeUser);

        clientSocket.on('accountUpdated', (data) => {
            console.log(fakeUser)
            expect(data).toEqual(fakeUser);
            done();
        });

        clientSocket.emit('updateChatBanned', fakeUser.username, true);
    });
});

describe('updateLastRedemptionDate', () => {
    // ChatGPT usage: No
    // Input: userID, redemptionDate
    // Expected behavior: Emit 'updateLastRedemptionDate' event
    // Expected output: None
    it('should trigger when client emits updateLastRedemptionDate event', (done) => {
        const fakeUser = { userId: 'testUserID', username: 'testUser', rDate: new Date().toISOString() };
        mockInstances.mockUpdateOne.mockResolvedValue(fakeUser);
        fakeUser.rDate = new Date().toISOString();
        mockInstances.mockFindOne.mockResolvedValue(fakeUser);

        clientSocket.on('accountUpdated', (data) => {
            console.log(fakeUser)
            expect(data).toEqual(fakeUser);
            done();
        });

        clientSocket.emit('updateLastRedemptionDate', fakeUser.username, new Date().toISOString());
    });
});

describe('deleteUser', () => {
    // ChatGPT usage: No
    // Input: userId
    // Expected behavior: Emit 'deleteUser' event
    // Expected output: None
    it('should trigger when client emits deleteUser event', (done) => {
        
        mockInstances.mockDeleteOne.mockResolvedValue(true);

        clientSocket.on('userDeleted', (data) => {
            expect(data).toEqual("User with ID 123 deleted successfully.");
            done();
        });

        clientSocket.emit('deleteUser', "123");
    });
});

describe('deleteAllUsers', () => {
    // ChatGPT usage: No
    // Input: None
    // Expected behavior: Emit 'deleteAllUsers' event
    // Expected output: None
    it('should trigger when client emits deleteAllUsers event', (done) => {
        mockInstances.mockDeleteMany.mockResolvedValue(true);

        clientSocket.on('allUsersDeleted', (data) => {
            expect(data).toEqual();
            done();
        });

        clientSocket.emit('deleteAllUsers');
    });
});

describe('createLobby', () => {
    // ChatGPT usage: No
    // Input: roomName, gameType, maxPlayers, userName
    // Expected behavior: Emit 'createLobby' event
    // Expected output: None
    it('should trigger when client emits createLobby event and lobby already exists', (done) => {
        const fakeLobby = { roomName: 'testRoom', gameType: 'testGameType', maxPlayers: 4 };
        mockInstances.mockFindOne.mockResolvedValue(fakeLobby);

        clientSocket.on('roomAlreadyExist', (data) => {
            console.log(fakeLobby)
            expect(data).toEqual("Room already exist");
            done();
        });

        clientSocket.emit('createLobby', 'testRoom', 'testGameType', 4, 'testUser');
    });

    // ChatGPT usage: No
    // Input: roomName, gameType, maxPlayers, userName
    // Expected behavior: Emit 'createLobby' event
    // Expected output: None
    it('should trigger when client emits createLobby event and lobby create successfully', (done) => {
        const fakeLobby = null;
        mockInstances.mockFindOne.mockResolvedValue(null);

        clientSocket.on('lobbyCreated', (data) => {
            console.log(fakeLobby)
            expect(data).toEqual("Lobby Successfully Created");
            done();
        });

        clientSocket.emit('createLobby', 'testRoom', 'testGameType', 4, 'testUser');
    });
});

describe('joinLobby', () => {
    // ChatGPT usage: No
    // Input: roomName, userName
    // Expected behavior: Emit 'joinLobby' event
    // Expected output: None
    it('should trigger when client emits joinLobby event and joins successfully', (done) => {
        const fakeLobby = {
            roomName: 'testRoom',
            gameType: 'testGameType',
            players: {'testUser': {bet: 100, ready: false, socketId: 'socket123'}},
            gameStarted: false,
            maxPlayers: 4
          };
        mockInstances.mockFindOne.mockResolvedValue(fakeLobby);

        clientSocket.on('newPlayerJoin', (data) => {
            console.log(data)
            expect(data).toEqual();
            done();
        });

        clientSocket.emit('joinLobby', 'testRoom', 'testUser');
    });

    it('should trigger when client emits joinLobby event and lobby is full', (done) => {
        const fakeLobby = {
            roomName: 'testRoom',
            gameType: 'testGameType',
            players: {'testUser': {bet: 100, ready: false, socketId: 'socket123'}},
            gameStarted: false,
            maxPlayers: 0
          };
        mockInstances.mockFindOne.mockResolvedValue(fakeLobby);

        clientSocket.on('PlayerExceedMax', (data) => {
            console.log(data)
            expect(data).toEqual('PlayerExceedMax');
            done();
        });

        clientSocket.emit('joinLobby', 'testRoom', 'testUser');
    });

    it('should trigger when client emits joinLobby event and lobby does not exist', (done) => {
        const fakeLobby = null
        mockInstances.mockFindOne.mockResolvedValue(fakeLobby);

        clientSocket.on('roomDoesNot', (data) => {
            console.log(data)
            expect(data).toEqual('Room does not exist');
            done();
        });

        clientSocket.emit('joinLobby', 'testRoom', 'testUser');
    });

});

describe('sendChatMessage', () => {
    // ChatGPT usage: No
    // Input: roomName, userName, message
    // Expected behavior: Emit 'sendChatMessage' event
    // Expected output: None
    it('should trigger when client emits sendChatMessage event', (done) => {
        const fakemessage = {user: 'testUser', text: 'Hello!'};
        mockInstances.mockInsertOne(fakemessage)
        clientSocket.on('sendMessageSuccessfully', (data) => {
            console.log(data)
            expect(data).toEqual('sendMessageSuccessfully');
            done();
        });

        clientSocket.emit('sendChatMessage', 'testRoom', 'testUser', 'Hello!');
    });
});

describe('getAllLobby', () => {
    // ChatGPT usage: No
    // Input: None
    // Expected behavior: Emit 'getAllLobby' event
    // Expected output: None
    it('should trigger when client emits getAllLobby event', (done) => {
        const fakeLobby = {
            roomName: 'testRoom',
            gameType: 'testGameType',
            players: {'testUser': {bet: 100, ready: false, socketId: 'socket123'}},
            gameStarted: false,
            maxPlayers: 0
        };

        mockInstances.mocktoArray(fakeLobby);
        clientSocket.on('getAllLobbySuccessfully', (data) => {
            console.log(data)
            expect(data).toEqual('getAllLobbySuccessfully');
            done();
        });

        clientSocket.emit('getAllLobby');
    });
});

describe('setBet', () => {
    // ChatGPT usage: No
    // Input: roomName, userName, bet
    // Expected behavior: Emit 'setBet' event
    // Expected output: None
    it('should trigger when client emits setBet event', (done) => {
        const fakeBet = {bet: 100};
        mockInstances.mockUpdateOne(fakeBet)

        clientSocket.on('setBetSuccessfully', (data) => {
            console.log(data)
            expect(data).toEqual('setBetSuccessfully');
            done();
        });

        clientSocket.emit('setBet', 'testRoom', 'testUser', 100);
    });
});

describe('setReady', () => {
    // ChatGPT usage: No
    // Input: roomName, userName
    // Expected behavior: Emit 'setReady' event
    // Expected output: None
    it('should trigger when client emits setReady event', (done) => {
        const fakeLobby = {
            roomName: 'testRoom',
            gameType: 'testGameType',
            players: {'testUser': {bet: 100, ready: true, socketId: 'socket123'}},
            gameStarted: false,
            maxPlayers: 0
        };
        mockInstances.mockFindOne.mockResolvedValue(fakeLobby);
        mockInstances.mockUpdateOne(fakeLobby)

        clientSocket.on('setReadySuccessfully', (data) => {
            console.log(data)
            expect(data).toEqual('setReadySuccessfully');
            done();
        });
        clientSocket.emit('setReady', 'testRoom', 'testUser');
    });

    // ChatGPT usage: No
    // Input: roomName, userName
    // Expected behavior: Emit 'setReady' event
    // Expected output: None
    it('should play roulette', (done) => {
        const fakeLobby = {
            roomName: 'testRoom',
            gameType: 'Roulette',
            players: {"playera": {"red": 100, "black": 0, "odd": 0, "even": 0, "green": 0}},
            gameStarted: false,
            maxPlayers: 0
        };
        mockInstances.mockFindOne.mockResolvedValue(fakeLobby);
        mockInstances.mockUpdateOne(fakeLobby)

        clientSocket.on('setReadySuccessfully', (data) => {
            console.log(data)
            expect(data).toEqual('setReadySuccessfully');
            done();
        });
        clientSocket.emit('setReady', 'testRoom', 'testUser');
    });

    // ChatGPT usage: No
    // Input: roomName, userName
    // Expected behavior: Emit 'setReady' event
    // Expected output: None
    it('should start baaractte', (done) => {
        const fakeLobby = {
            roomName: 'testRoom',
            gameType: 'Baccarat',
            players: {"playera": {"win":"PlayersWin", "amount": 100}},
            gameStarted: false,
            maxPlayers: 0
        };
        mockInstances.mockFindOne.mockResolvedValue(fakeLobby);
        mockInstances.mockUpdateOne(fakeLobby)

        clientSocket.on('setReadySuccessfully', (data) => {
            console.log(data)
            expect(data).toEqual('setReadySuccessfully');
            done();
        });
        clientSocket.emit('setReady', 'testRoom', 'testUser');
    });

    // ChatGPT usage: No
    // Input: roomName, userName
    // Expected behavior: Emit 'setReady' event
    // Expected output: None
    it('should start Blackjack', (done) => {
        const fakeLobby = {
            roomName: 'testRoom',
            gameType: 'Blackjack',
            players: {"playera": 100},
            gameStarted: false,
            maxPlayers: 0
        };
        mockInstances.mockFindOne.mockResolvedValue(fakeLobby);
        mockInstances.mockUpdateOne(fakeLobby)

        clientSocket.on('setReadySuccessfully', (data) => {
            console.log(data)
            expect(data).toEqual('setReadySuccessfully');
            done();
        });
        clientSocket.emit('setReady', 'testRoom', 'testUser');
    });
});

describe('getPlayerCount', () => {
    // ChatGPT usage: No
    // Input: roomName
    // Expected behavior: Emit 'getPlayerCount' event
    // Expected output: None
    it('should trigger when client emits getPlayerCount event', (done) => {
        const fakeLobby = {
            roomName: 'testRoom',
            gameType: 'testGameType',
            players: {'testUser': {bet: 100, ready: true, socketId: 'socket123'}},
            gameStarted: false,
            maxPlayers: 0
        };
        mockInstances.mockFindOne.mockResolvedValue(fakeLobby);
        mockInstances.mockUpdateOne(fakeLobby)
        
        clientSocket.on('getCountSuccessfully', (data) => {
            console.log(data)
            expect(data).toEqual('getCountSuccessfully');
            done();
        });

        clientSocket.emit('getPlayerCount', 'testRoom');
    });
});

describe('leaveLobby', () => {
    // ChatGPT usage: No
    // Input: None
    // Expected behavior: Emit 'leaveLobby' event
    // Expected output: None
    it('should trigger when client emits leaveLobby event', (done) => {
        const fakeLobbies = [
            {
              roomName: 'room123',
              gameType: 'BlackJack',
              players: {'user1': {bet: 100, ready: false, socketId: 'socket123'}},
              maxPlayers: 4
            },
            {
              roomName: 'room124',
              gameType: 'Baccarat',
              players: {'user2': {bet: {win: "PlayersWin", amount: 3}, ready: true, socketId: 'socket124'}},
              maxPlayers: 6
            }
          ];

        mockInstances.mocktoArray.mockResolvedValue(fakeLobbies);
        mockInstances.mockFindOne.mockResolvedValue(fakeLobbies);
        mockInstances.mockUpdateOne(fakeLobbies)

        clientSocket.on('leaveSuccessfully', (data) => {
            console.log(data)
            expect(data).toEqual('leaveSuccessfully');
            done();
        });

        clientSocket.emit('leaveLobby');
    });
});

describe('playTurn', () => {
    // ChatGPT usage: No
    // Input: lobbyName, userName, action
    // Expected behavior: Emit 'playTurn' event
    // Expected output: None
    it('should trigger when client emits playTurn event', (done) => {
        clientSocket.on('turnSuccessfully', (data) => {
            console.log(data)
            expect(data).toEqual('turnSuccessfully');
            done();
        });

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

        mockInstances.mockFindOne.mockResolvedValue(gameData);

        clientSocket.emit('playTurn', 'testLobby', 'testUser', 'hold');
    });
});
