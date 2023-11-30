const express = require('express');
const http = require('http');
// const https = require('https')
const socketIo = require('socket.io');
// const fs = require('fs');
const cors = require('cors');
//const path = require('path');

// server configuration
const app = express();
app.use(express.static(__dirname));
// const keysPath = path.join(__dirname, 'data', 'private.key');
// let options;

// if (fs.existsSync(keysPath)) {
//   // If the file exists, require the JSON file.
//   options = {
//     key: fs.readFileSync('data/private.key'),
//     cert: fs.readFileSync('data/certificate.crt'),
//     ca: fs.readFileSync('data/ca_bundle.crt')
// };
// } else {
//   // If the file does not exist, set keys to 0.
//   options = {
//     key: "",
//     cert: "",
//     ca: ""
// };
// }


// server types
const server = http.createServer(app);
// const https_server = https.createServer(options, app);
// const SERVER_TYPE = 'http';
const SERVER_PORT = 8081;

// io and access management based on https or http
var io;
// if (SERVER_TYPE === 'http') {
    io = socketIo(server);
// } //else if (SERVER_TYPE === 'https') {
    //io = socketIo(https_server);
//}
app.use(cors());

const UserStore = require('./UserStore');
const UserAccount = require('./UserAccount'); // Assuming you also export the UserAccount class
const GameLobby = require('./GameLobby');
const GameLobbyStore = require('./GameLobbyStore');
const GameManager = require('./GameManager/GameManager');

const MONGO_CONNECTION_STRING = 'mongodb://127.0.0.1:27017'; // Adjust to your MongoDB connection string
const USERDB_NAME = 'UserDB'; // Name of the database
const LOBBYDB_NAME = 'gameLobbyDB'

const userStore = new UserStore(MONGO_CONNECTION_STRING, USERDB_NAME);

// ChatGPT usage: No
(async () => {
    await userStore.connect();
})();

const userAccount = new UserAccount(io, userStore);

const gameLobbyStore = new GameLobbyStore(MONGO_CONNECTION_STRING, LOBBYDB_NAME);
// const gameLobbies = {};

// ChatGPT usage: No
(async () => {
    await gameLobbyStore.init();
})();

// ChatGPT usage: No
const gameManager = new GameManager(io);
(async () => {
    await gameManager.connect();
})();

const gameLobby = new GameLobby(gameManager, gameLobbyStore, io);

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
    socket.on('changebalancebyname', (username, amount) =>{
        userAccount.changebalancebyname(socket, username, amount);
    })

    // ChatGPT usage: No
    socket.on('withdraw', (userId, amount) => {
        userAccount.withdraw(socket, userId, amount);
    });

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
        await gameLobby.init(roomName, gameType, maxPlayers, socket);
    });

    // ChatGPT usage: Partial
    socket.on('joinLobby', async (roomName, userName) => {
        await gameLobby.addPlayer(roomName, userName, 0, socket);
    });

    // ChatGPT usage: Partial
    socket.on('sendChatMessage', async (roomName, userName, message) =>{
        await gameLobby.sendChatMessage(roomName, userName, message);
        socket.emit('sendMessageSuccessfully', "sendMessageSuccessfully");
    })

    // ChatGPT usage: No
    socket.on('getAllLobby', async () => {
        await gameLobby.getAllLobby(socket);
        socket.emit('getAllLobbySuccessfully', "getAllLobbySuccessfully");
    });

    // ChatGPT usage: No
    socket.on('setBet', async(roomName, userName, bet) => {
        await gameLobby.setPlayerBet(roomName, userName, bet);
        socket.emit('setBetSuccessfully', "setBetSuccessfully");
    })

    // ChatGPT usage: No
    socket.on('setReady', async(roomName, userName) => {
        await gameLobby.setPlayerReady(roomName, userName);
        socket.emit('setReadySuccessfully', "setReadySuccessfully");
    })


    // ChatGPT usage: No
    socket.on('getPlayerCount', async(roomName) => {
        await gameLobby.getPlayerCount(roomName);
        socket.emit('getCountSuccessfully', "getCountSuccessfully");
    })

    // ChatGPT usage: Partial
    socket.on('leaveLobby', async () => {
        await gameLobby.removePlayer(socket);
        socket.emit('leaveSuccessfully', "leaveSuccessfully");
    });

    // ChatGPT usage: partial
    socket.on('playTurn', (lobbyName, username, action) => {
        gameManager.playTurn(lobbyName, username, action);
        socket.emit('turnSuccessfully', "turnSuccessfully");
    })

    // ChatGPT usage: Partial
    // socket.on('disconnect', async () => {
    //     // console.log("User disconnected");
    //     // for(let roomName in gameLobbies) {
    //     //     for(let userName in gameLobbies[roomName].players) {
    //     //         if(gameLobbies[roomName].players[userName].socketId === socket.id) {
    //     //             gameLobbies[roomName].removePlayer(userName, socket);
    //     //             break;
    //     //         }
    //     //     }
    //     // }
    //     await gameLobby.removePlayer(socket);
    // });

});

// ChatGPT usage: No
// app.get('/test', (req, res) => {
//     res.send('Greetings from ACE');
// });

// ChatGPT usage: No
// if (SERVER_TYPE === 'http') {
    server.listen(SERVER_PORT, () => {
        console.log('listen to port: ' + SERVER_PORT + ': http');
    // 
})
// } else if (SERVER_TYPE === 'https') {
//     https_server.listen(SERVER_PORT, () => {
//         console.log('listen to port: ' + SERVER_PORT + ': https');
//     })
// } else {
//     // throw exception
//     console.log('server type not supported');
// }
