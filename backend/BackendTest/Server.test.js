const { Server } = require("socket.io");
const Client = require("socket.io-client");
const { mock } = require('node:test');
const { app } = require('../server'); // assuming that your server file is named server.js
let io, serverSocket, clientSocket;

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

afterAll(() => {
    io.close();
    clientSocket.close();
});

describe('retrieveAccount', () => {
    it('should trigger when client emits retrieveAccount event', (done) => {
        clientSocket.emit('retrieveAccount', 'testUserID');
        // done();
    });
});

describe('updateAccount', () => {
    it('should trigger when client emits updateAccount event', (done) => {
        clientSocket.emit('updateAccount', {userId: 123, username: "David"});
        // done();
    });
});

describe('createAccount', () => {
    it('should trigger when client emits createAccount event', (done) => {
        clientSocket.emit('createAccount', {userId: 123, username: "David"});
        // done();
    });
});

describe('updateName', () => {
    it('should trigger when client emits updateName event', (done) => {
        clientSocket.emit('updateName', 'userIdExample', 'newNameExample');
        // done();
    });
});

describe('updateAdminStatus', () => {
    it('should trigger when client emits updateAdminStatus event', (done) => {
        clientSocket.emit('updateAdminStatus', 'usernameExample', true);
        // done();
    });
});

describe('deposit', () => {
    it('should trigger when client emits deposit event', (done) => {
        clientSocket.emit('deposit', 'testUserID', 100);
        // done();
    });
});

describe('depositbyname', () => {
    it('should trigger when client emits depositbyname event', (done) => {
        clientSocket.emit('depositbyname', 'testUsername', 100);
        // done();
    });
});

describe('withdraw', () => {
    it('should trigger when client emits withdraw event', (done) => {
        clientSocket.emit('withdraw', 'testUserID', 50);
        // done();
    });
});


describe('updateChatBanned', () => {
    it('should trigger when client emits updateChatBanned event', (done) => {
        clientSocket.emit('updateChatBanned', 'testUsername', true);
        // done();
    });
});

describe('updateLastRedemptionDate', () => {
    it('should trigger when client emits updateLastRedemptionDate event', (done) => {
        clientSocket.emit('updateLastRedemptionDate', 'testUserID', new Date().toISOString());
        // done();
    });
});

describe('deleteUser', () => {
    it('should trigger when client emits deleteUser event', (done) => {
        clientSocket.emit('deleteUser', 'testUserID');
        // done();
    });
});

describe('deleteAllUsers', () => {
    it('should trigger when client emits deleteAllUsers event', (done) => {
        clientSocket.emit('deleteAllUsers');
        // done();
    });
});

describe('createLobby', () => {
  it('should trigger when client emits createLobby event', (done) => {
      // serverSocket.on('createLobby', (roomName, gameType, maxPlayers, userName) => {
      //     expect(roomName).toBeDefined();
      //     expect(gameType).toBeDefined();
      //     expect(maxPlayers).toBeDefined();
      //     expect(userName).toBeDefined();
      //     done();
      // });

      clientSocket.emit('createLobby', 'testRoom', 'testGameType', 4, 'testUser');
      // done()
  });
});

describe('joinLobby', () => {
  it('should trigger when client emits joinLobby event', (done) => {
      // serverSocket.on('joinLobby', (roomName, userName) => {
      //     expect(roomName).toBeDefined();
      //     expect(userName).toBeDefined();
      //     done();
      // });

      clientSocket.emit('joinLobby', 'testRoom', 'testUser');
      // done();
  });
});

describe('sendChatMessage', () => {
  it('should trigger when client emits sendChatMessage event', (done) => {
      // serverSocket.on('sendChatMessage', (roomName, userName, message) => {
      //     expect(roomName).toBeDefined();
      //     expect(userName).toBeDefined();
      //     expect(message).toBeDefined();
      //     done();
      // });

      clientSocket.emit('sendChatMessage', 'testRoom', 'testUser', 'Hello!');
      // done();
  });
});

describe('getAllLobby', () => {
  it('should trigger when client emits getAllLobby event', (done) => {
      // serverSocket.on('getAllLobby', () => {
      //     done();
      // });

      clientSocket.emit('getAllLobby');
      // done();
  });
});

describe('setBet', () => {
  it('should trigger when client emits setBet event', (done) => {
      // serverSocket.on('setBet', (roomName, userName, bet) => {
      //     expect(roomName).toBeDefined();
      //     expect(userName).toBeDefined();
      //     expect(bet).toBeDefined();
      //     done();
      // });

      clientSocket.emit('setBet', 'testRoom', 'testUser', 100);
      // done();
  });
});

describe('setReady', () => {
  it('should trigger when client emits setReady event', (done) => {
      // serverSocket.on('setReady', (roomName, userName) => {
      //     expect(roomName).toBeDefined();
      //     expect(userName).toBeDefined();
      //     done();
      // });

      clientSocket.emit('setReady', 'testRoom', 'testUser');
      // done();
  });
});

describe('getPlayerCount', () => {
  it('should trigger when client emits getPlayerCount event', (done) => {
      // serverSocket.on('getPlayerCount', (roomName) => {
      //     expect(roomName).toBeDefined();
      //     done();
      // });

      clientSocket.emit('getPlayerCount', 'testRoom');
      // done();
  });
});

describe('leaveLobby', () => {
  it('should trigger when client emits leaveLobby event', (done) => {
      // serverSocket.on('leaveLobby', () => {
      //     done();
      // });

      clientSocket.emit('leaveLobby');
      // done();
  });
});

describe('playTurn', () => {
  it('should trigger when client emits playTurn event', (done) => {
      // serverSocket.on('playTurn', (lobbyName, username, action) => {
      //     expect(lobbyName).toBeDefined();
      //     expect(username).toBeDefined();
      //     expect(action).toBeDefined();
      //     done();
      // });

      clientSocket.emit('playTurn', 'testLobby', 'testUser', 'testAction');
      // done();
  });
});

// describe('disconnect', () => {
//   it('should trigger when client emits disconnect event', (done) => {
//       serverSocket.on('disconnect', () => {
//           done();
//       });

//       clientSocket.emit('disconnect');
//   });
// });


