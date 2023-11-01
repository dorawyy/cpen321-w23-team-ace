const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(express.static(__dirname));
const server = http.createServer(app);
const io = socketIo(server);
const cors = require('cors');
app.use(cors());

const UserStore = require('./UserStore');
const UserAccount = require('./UserAccount'); // Assuming you also export the UserAccount class
const GameLobby = require('./GameLobby');
const GameLobbyStore = require('./GameLobbyStore');
const LiveChat = require('./LiveChat');
const GameManager = require('./GameManager/GameManager');

const MONGO_CONNECTION_STRING = 'mongodb://localhost:27017'; // Adjust to your MongoDB connection string
const USERDB_NAME = 'UserDB'; // Name of the database
const LOBBYDB_NAME = 'gameLobbyDB'

const userStore = new UserStore(MONGO_CONNECTION_STRING, USERDB_NAME);

// ChatGPT usage: No
(async () => {
    await userStore.connect();
})();

const userAccount = new UserAccount(io, userStore);

const gameLobbyStore = new GameLobbyStore(MONGO_CONNECTION_STRING, LOBBYDB_NAME);
const gameLobbies = {};

// ChatGPT usage: No
(async () => {
    await gameLobbyStore.init();
})();

// ChatGPT usage: No
const gameManager = new GameManager(io);
(async () => {
    await gameManager.connect();
})();

// ChatGPT usage: Partial
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // ChatGPT usage: Yes
    socket.on('retrieveAccount', (userId) => {
        userAccount.retrieveAccount(socket, userId);
    });

    // ChatGPT usage: No
    socket.on('updateAccount', (userInfo) => {
        userAccount.updateAccount(socket, userInfo);
    });
    
    // ChatGPT usage: Yes
    socket.on('createAccount', (userInfo) => {
        userAccount.createAccount(socket, userInfo);
    });

    // ChatGPT usage: No
    socket.on('updateName', (userId, newname) => {
        userAccount.updateName(socket, userId, newname);
    });

    // ChatGPT usage: No
    socket.on('updateAdminStatus', (username, AdminStatus) => {
        userAccount.updateAdminStatus(socket, username, AdminStatus);
    });

    // ChatGPT usage: No
    socket.on('updateChatBanned', (username, ChatBannedStatus) => {
        userAccount.updateChatBanned(socket, username, ChatBannedStatus);
    });

    // ChatGPT usage: No
    socket.on('updateLastRedemptionDate', (userID, rDate) => {
        userAccount.updateLastRedemptionDate(socket, userID, rDate);
    });

    // ChatGPT usage: No
    socket.on('deposit', (userId, amount) => {
        userAccount.deposit(socket, userId, amount);
    });

    // ChatGPT usage: No
    socket.on('depositbyname', (username, amount) =>{
        userAccount.depositbyname(socket, username, amount);
    })

    // ChatGPT usage: No
    socket.on('withdraw', (userId, amount) => {
        userAccount.withdraw(socket, userId, amount);
    });

    // socket.on('disconnect', () => {
    //     console.log('User disconnected:', socket.id);
    // });

    // ChatGPT usage: Yes
    socket.on('deleteUser', async (userId) => {
       userAccount.deleteUser(socket, userId);
    });
    
    // ChatGPT usage: No
    socket.on('deleteAllUsers', async () => {
       userAccount.deleteAllUsers(socket);
    });

    // ChatGPT usage: Partial
    socket.on('createLobby', async (roomName, gameType, maxPlayers, userName) => {
        console.log("Lobby created");
        if(!gameLobbies[roomName]) {
            // Set GameManager = null for now
            const lobby = new GameLobby(roomName, gameType, maxPlayers, null, gameLobbyStore, io);
            await lobby.init(roomName, gameType, maxPlayers);
            gameLobbies[roomName] = lobby;
            socket.emit('lobbyCreated', "Lobby Successfully Created");
        }
        else {
            socket.emit('roomAlreadyExist', "Room already exist");
        }

    });

    // ChatGPT usage: Partial
    socket.on('joinLobby', async (roomName, userName) => {
        console.log("User joined");
        if(gameLobbies[roomName]) {
            // Set bet = 0 initially
            await gameLobbies[roomName].addPlayer(userName, 0, socket);
            gameLobbies[roomName].registerSocketEvents(socket);
        }
        else {
            socket.emit('roomDoesNot', "Room does not exist");
        }
    });

    // ChatGPT usage: No
    socket.on('getAllLobby', async () => {
        var myLobbies = await gameLobbyStore.getAllLobby();
        socket.emit('AllLobby', myLobbies);
    });

    // ChatGPT usage: No
    socket.on('setBet', async(roomName, userName, bet) => {
        await gameLobbies[roomName].setPlayerBet(roomName, userName, bet);
    })

    // ChatGPT usage: No
    socket.on('getPlayerCount', async(roomName) => {
        var playerCount = await gameLobbies[roomName].getPlayerCount(roomName);
        io.to(roomName).emit('playerCount', playerCount);
    })

    // socket.on('playerLeft', async(userName, roomName) => {
    //     var playerCount = await gameLobbies[roomName].getPlayerCount(roomName);
    //     io.to(roomName).emit('playerCount', playerCount);
    // })

    // ChatGPT usage: Partial
    socket.on('leaveLobby', () => {
        console.log("User left lobby");
        for(let roomName in gameLobbies) {
            for(let userName in gameLobbies[roomName].players) {
                if(gameLobbies[roomName].players[userName].socketId === socket.id) {
                    gameLobbies[roomName].removePlayer(userName);
                    break;
                }
            }
        }
    });

    // ChatGPT usage: partial
    socket.on('playTurn', (lobbyName, username, action) => {
        this.GameManager.playTurn(lobbyName, username, action);
    })

    // ChatGPT usage: Partial
    socket.on('disconnect', () => {
        console.log("User disconnected");
        for(let roomName in gameLobbies) {
            for(let userName in gameLobbies[roomName].players) {
                if(gameLobbies[roomName].players[userName].socketId === socket.id) {
                    gameLobbies[roomName].removePlayer(userName);
                    break;
                }
            }
        }
    });

});

// ChatGPT usage: No
server.listen(3000, () => {
    console.log('listen to port 3000');
})
