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

describe('connection', () => {
    it('should log user connection', () => {
        const spy = jest.spyOn(console, 'log');
        clientSocket.emit('connection');
        expect(spy).toHaveBeenCalledWith('A user connected:', expect.any(String));
    });
});