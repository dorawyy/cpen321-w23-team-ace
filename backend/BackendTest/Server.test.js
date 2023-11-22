const { Server } = require("socket.io");
const { MongoClient } = require('mongodb');
const GameLobbyStore = require('../GameLobbyStore');
const UserStore = require('../UserStore');
const Client = require("socket.io-client");
const { mock } = require('node:test');
const { app } = require('../server'); // assuming that your server file is named server.js
let io, serverSocket, clientSocket;

jest.mock('mongodb', () => {
    const collectionMock = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    };
  
    const dbMock = {
      collection: jest.fn().mockReturnValue(collectionMock)
    };
  
    const mClientMock = {
      connect: jest.fn().mockResolvedValue(),
      db: jest.fn().mockReturnValue(dbMock),
      close: jest.fn()
    };
  
    return { MongoClient: jest.fn(() => mClientMock) };
});

beforeAll((done) => {
    const httpServer = require('http').createServer(app);
    io = new Server(httpServer);
    httpServer.listen(() => {
        const port = httpServer.address().port;
        clientSocket = new Client(`http://localhost:443`);
        io.on("connection", socket => {
            serverSocket = socket;
        });
        clientSocket.on("connect", done);
    });
});

beforeEach(async () => {
    
    let mockClient;
    let mockDB;
    let mockCollection;
    let userStore;
    let gameLobbyStore

    mockClient = new MongoClient();
    mockDB = mockClient.db();
    mockCollection = mockDB.collection();

    userStore = new UserStore("mongodb://localhost:27017", "testDB");
    gameLobbyStore = new GameLobbyStore("mongodb://localhost:27017", "testDB");
  });

  

afterAll(() => {
    io.close();
    clientSocket.close();
});

afterEach(() => {
    jest.clearAllMocks();
  });

describe('retrieveAccount', () => {
    // ChatGPT usage: No
    // Input: 'testUserID'
    // Expected behavior: Emit 'retrieveAccount' event
    // Expected output: None
    it('should trigger when client emits retrieveAccount event', (done) => {
        clientSocket.emit('retrieveAccount', 'testUserID');
    }, 1);
});

describe('updateAccount', () => {
    // ChatGPT usage: No
    // Input: userInfo
    // Expected behavior: Emit 'updateAccount' event
    // Expected output: None
    it('should trigger when client emits updateAccount event', (done) => {
        clientSocket.emit('updateAccount', {userId: 123, username: "David"});
    }, 1);
});

describe('createAccount', () => {
    // ChatGPT usage: No
    // Input: userInfo
    // Expected behavior: Emit 'createAccount' event
    // Expected output: None
    it('should trigger when client emits createAccount event', (done) => {
        clientSocket.emit('createAccount', {userId: 123, username: "David"});
    }, 1);
});

describe('updateName', () => {
    // ChatGPT usage: No
    // Input: userId, newName
    // Expected behavior: Emit 'updateName' event
    // Expected output: None
    it('should trigger when client emits updateName event', (done) => {
        clientSocket.emit('updateName', 'userIdExample', 'newNameExample');
    }, 1);
});

describe('updateAdminStatus', () => {
    // ChatGPT usage: No
    // Input: username, adminStatus
    // Expected behavior: Emit 'updateAdminStatus' event
    // Expected output: None
    it('should trigger when client emits updateAdminStatus event', (done) => {
        clientSocket.emit('updateAdminStatus', 'usernameExample', true);
    }, 1);
});

describe('deposit', () => {
    // ChatGPT usage: No
    // Input: userId, amount
    // Expected behavior: Emit 'deposit' event
    // Expected output: None
    it('should trigger when client emits deposit event', (done) => {
        clientSocket.emit('deposit', 'testUserID', 100);
    }, 1);
});

describe('depositbyname', () => {
    // ChatGPT usage: No
    // Input: username, amount
    // Expected behavior: Emit 'depositbyname' event
    // Expected output: None
    it('should trigger when client emits depositbyname event', (done) => {
        clientSocket.emit('depositbyname', 'testUsername', 100);
    }, 1);
});

describe('withdraw', () => {
    // ChatGPT usage: No
    // Input: userId, amount
    // Expected behavior: Emit 'withdraw' event
    // Expected output: None
    it('should trigger when client emits withdraw event', (done) => {
        clientSocket.emit('withdraw', 'testUserID', 50);
    }, 1);
});


describe('updateChatBanned', () => {
    // ChatGPT usage: No
    // Input: username, chatBannedStatus
    // Expected behavior: Emit 'updateChatBanned' event
    // Expected output: None
    it('should trigger when client emits updateChatBanned event', (done) => {
        clientSocket.emit('updateChatBanned', 'testUsername', true);
    }, 1);
});

describe('updateLastRedemptionDate', () => {
    // ChatGPT usage: No
    // Input: userID, redemptionDate
    // Expected behavior: Emit 'updateLastRedemptionDate' event
    // Expected output: None
    it('should trigger when client emits updateLastRedemptionDate event', (done) => {
        clientSocket.emit('updateLastRedemptionDate', 'testUserID', new Date().toISOString());
    }, 1);
});

describe('deleteUser', () => {
    // ChatGPT usage: No
    // Input: userId
    // Expected behavior: Emit 'deleteUser' event
    // Expected output: None
    it('should trigger when client emits deleteUser event', (done) => {
        clientSocket.emit('deleteUser', 'testUserID');
    }, 1);
});

describe('deleteAllUsers', () => {
    // ChatGPT usage: No
    // Input: None
    // Expected behavior: Emit 'deleteAllUsers' event
    // Expected output: None
    it('should trigger when client emits deleteAllUsers event', (done) => {
        clientSocket.emit('deleteAllUsers');
    }, 1);
});

describe('createLobby', () => {
    // ChatGPT usage: No
    // Input: roomName, gameType, maxPlayers, userName
    // Expected behavior: Emit 'createLobby' event
    // Expected output: None
    it('should trigger when client emits createLobby event', (done) => {
        clientSocket.emit('createLobby', 'testRoom', 'testGameType', 4, 'testUser');
    }, 1);
});

describe('joinLobby', () => {
    // ChatGPT usage: No
    // Input: roomName, userName
    // Expected behavior: Emit 'joinLobby' event
    // Expected output: None
    it('should trigger when client emits joinLobby event', (done) => {
        clientSocket.emit('joinLobby', 'testRoom', 'testUser');
    }, 1);
});

describe('sendChatMessage', () => {
    // ChatGPT usage: No
    // Input: roomName, userName, message
    // Expected behavior: Emit 'sendChatMessage' event
    // Expected output: None
    it('should trigger when client emits sendChatMessage event', (done) => {
        clientSocket.emit('sendChatMessage', 'testRoom', 'testUser', 'Hello!');
    }, 1);
});

describe('getAllLobby', () => {
    // ChatGPT usage: No
    // Input: None
    // Expected behavior: Emit 'getAllLobby' event
    // Expected output: None
    it('should trigger when client emits getAllLobby event', (done) => {
        clientSocket.emit('getAllLobby');
    }, 1);
});

describe('setBet', () => {
    // ChatGPT usage: No
    // Input: roomName, userName, bet
    // Expected behavior: Emit 'setBet' event
    // Expected output: None
    it('should trigger when client emits setBet event', (done) => {
        clientSocket.emit('setBet', 'testRoom', 'testUser', 100);
    }, 1);
});

describe('setReady', () => {
    // ChatGPT usage: No
    // Input: roomName, userName
    // Expected behavior: Emit 'setReady' event
    // Expected output: None
    it('should trigger when client emits setReady event', (done) => {
        clientSocket.emit('setReady', 'testRoom', 'testUser');
    }, 1);
});

describe('getPlayerCount', () => {
    // ChatGPT usage: No
    // Input: roomName
    // Expected behavior: Emit 'getPlayerCount' event
    // Expected output: None
    it('should trigger when client emits getPlayerCount event', (done) => {
        clientSocket.emit('getPlayerCount', 'testRoom');
    }, 1);
});

describe('leaveLobby', () => {
    // ChatGPT usage: No
    // Input: None
    // Expected behavior: Emit 'leaveLobby' event
    // Expected output: None
    it('should trigger when client emits leaveLobby event', (done) => {
        clientSocket.emit('leaveLobby');
    }, 1);
});

describe('playTurn', () => {
    // ChatGPT usage: No
    // Input: lobbyName, userName, action
    // Expected behavior: Emit 'playTurn' event
    // Expected output: None
    it('should trigger when client emits playTurn event', (done) => {
        clientSocket.emit('playTurn', 'testLobby', 'testUser', 'testAction');
    }, 1);
});
