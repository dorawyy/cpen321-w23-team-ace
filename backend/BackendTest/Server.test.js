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
        clientSocket = new Client(`http://localhost:${port}`);
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
        serverSocket.on('retrieveAccount', (userId) => {
            expect(userId).toBeDefined();
            done();
        });

        clientSocket.emit('retrieveAccount', 'testUserID');
    });
});

describe('updateAccount', () => {
    it('should trigger when client emits updateAccount event', (done) => {
        serverSocket.on('updateAccount', (userInfo) => {
            expect(userInfo).toBeDefined();
            done();
        });

        clientSocket.emit('updateAccount', {userId: 123, username: "David"});
    });
});

describe('createAccount', () => {
    it('should trigger when client emits createAccount event', (done) => {
        serverSocket.on('createAccount', (userInfo) => {
            expect(userInfo).toBeDefined();
            done();
        });

        clientSocket.emit('createAccount', {userId: 123, username: "David"});
    });
});

describe('updateName', () => {
    it('should trigger when client emits updateName event', (done) => {
        serverSocket.on('updateName', (userId, newname) => {
            expect(userId).toBeDefined();
            expect(newname).toBeDefined();
            done();
        });

        clientSocket.emit('updateName', 'userIdExample', 'newNameExample');
    });
});

describe('updateAdminStatus', () => {
    it('should trigger when client emits updateAdminStatus event', (done) => {
        serverSocket.on('updateAdminStatus', (username, AdminStatus) => {
            expect(username).toBeDefined();
            expect(AdminStatus).toBeDefined();
            done();
        });

        clientSocket.emit('updateAdminStatus', 'usernameExample', true);
    });
});

describe('deposit', () => {
    it('should trigger when client emits deposit event', (done) => {
        serverSocket.on('deposit', (userId, amount) => {
            expect(userId).toBeDefined();
            expect(amount).toBeDefined();
            done();
        });

        clientSocket.emit('deposit', 'testUserID', 100);
    });
});

describe('depositbyname', () => {
    it('should trigger when client emits depositbyname event', (done) => {
        serverSocket.on('depositbyname', (username, amount) => {
            expect(username).toBeDefined();
            expect(amount).toBeDefined();
            done();
        });

        clientSocket.emit('depositbyname', 'testUsername', 100);
    });
});

describe('withdraw', () => {
    it('should trigger when client emits withdraw event', (done) => {
        serverSocket.on('withdraw', (userId, amount) => {
            expect(userId).toBeDefined();
            expect(amount).toBeDefined();
            done();
        });

        clientSocket.emit('withdraw', 'testUserID', 50);
    });
});


describe('updateChatBanned', () => {
    it('should trigger when client emits updateChatBanned event', (done) => {
        serverSocket.on('updateChatBanned', (username, ChatBannedStatus) => {
            expect(username).toBeDefined();
            expect(ChatBannedStatus).toBeDefined();
            done();
        });

        clientSocket.emit('updateChatBanned', 'testUsername', true);
    });
});

describe('updateLastRedemptionDate', () => {
    it('should trigger when client emits updateLastRedemptionDate event', (done) => {
        serverSocket.on('updateLastRedemptionDate', (userID, rDate) => {
            expect(userID).toBeDefined();
            expect(rDate).toBeDefined();
            done();
        });

        clientSocket.emit('updateLastRedemptionDate', 'testUserID', new Date().toISOString());
    });
});

describe('deleteUser', () => {
    it('should trigger when client emits deleteUser event', (done) => {
        serverSocket.on('deleteUser', (userId) => {
            expect(userId).toBeDefined();
            done();
        });

        clientSocket.emit('deleteUser', 'testUserID');
    });
});

describe('deleteAllUsers', () => {
    it('should trigger when client emits deleteAllUsers event', (done) => {
        serverSocket.on('deleteAllUsers', () => {
            done();
        });

        clientSocket.emit('deleteAllUsers');
    });
});

