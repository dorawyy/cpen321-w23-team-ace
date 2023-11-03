const GameLobbyStore = require('./GameLobbyStore');
const LiveChat = require('./LiveChat');

class GameLobby {
    // ChatGPT usage: Partial
    constructor(roomName, gameType, maxPlayers, gameManager, gameLobbyStore, io) {
        this.roomName = roomName;
        this.gameType = gameType;
        this.maxPlayers = maxPlayers;
        this.gameManager = gameManager;  
        this.gameLobbyStore = gameLobbyStore;
        this.io = io;
        this.gameStarted = false;
        this.players = {};
        this.counter = 0;
        this.liveChat = new LiveChat(io);      
    }

    // ChatGPT usage: No
    async init(roomName, gameType, maxPlayers) {
        await this.gameLobbyStore.insertLobby(roomName, gameType, maxPlayers);
    }

    // ChatGPT usage: Partial
    async addPlayer(userName, bet, socket) {
        console.log(this.counter);
        console.log(this.maxPlayers);
        if(this.counter < Number(this.maxPlayers)) {
            this.counter++;

            this.players[userName] = {
                name: userName,
                ready: false,
                // Initialize bet = 0
                bet: bet,
                socketId: socket.id
            };

            this.io.to(this.roomName).emit('newPlayer', userName);

            // this.liveChat.registerSocketEvents(socket, this.roomName, userName);

            socket.join(this.roomName);

            await this.gameLobbyStore.updateLobby(this.roomName, { players: this.players });
        }
        else {
            socket.emit('PlayerExceedMax', "PlayerExceedMax");
        }
    }



    // ChatGPT usage: Partial
    async removePlayer(userName, socket) {
        console.log(this.counter);
        this.counter--;
        
        this.io.to(this.roomName).emit('playerLeft', userName, this.roomName);
        // this.io.emit('playerLeft', userName, this.roomName);

        delete this.players[userName];
        socket.leave(this.roomName);

        await this.gameLobbyStore.updateLobby(this.roomName, { players: this.players });
        var result = await this.getPlayerCount(this.roomName);
        this.io.to(this.roomName).emit('playerCount', result);
        console.log("Remove Player successfully");
    }

    // ChatGPT usage: Partial
    async setPlayerReady(userName) {
        this.players[userName].ready = true;

        this.io.to(this.roomName).emit('playerReady', userName);

        await this.gameLobbyStore.setPlayerReady(this.roomName, userName);

        var result = await this.getPlayerCount(this.roomName);
        this.io.to(this.roomName).emit('playerCount', result);

        if (Object.values(this.players).every(p => p.ready)) {
            this.startGame();
        }
    }



    // ChatGPT usage: No
    async setPlayerBet(roomName, userName, bet) {
        this.players[userName].bet = bet;

        this.io.to(this.roomName).emit('setBet', userName);
        
        await this.gameLobbyStore.setPlayerBet(this.roomName, userName, bet);
    }

    // ChatGPT usage: Partial
    async startGame() {
        if (this.gameManager) {
            this.gameStarted = true;

            this.io.to(this.roomName).emit('gameStarted');

            const readyPlayers = Object.keys(this.players).filter(userName => this.players[userName].ready);

            const bets = {};
            for (let userName of readyPlayers) {
                bets[userName] = this.players[userName].bet;
            }
            await this.gameManager.startGame(this.roomName, readyPlayers, bets, this.gameType);

            for (let userName of readyPlayers) {
                this.players[userName].ready = false;
            }

            await this.gameLobbyStore.updateLobby(this.roomName, { players: this.players, gameStarted: this.gameStarted });
        } else {
            console.log("GameManager not initialized.");
        }
    }

    // ChatGPT usage: No
    async getAllLobby() {
        return await this.gameLobbyStore.getAllLobby();
    }

    // ChatGPT usage: No
    async deleteLobby(roomName) {
        await this.gameLobbyStore.deleteLobby(roomName);
    }

    // ChatGPT usage: No
    async getPlayerCount(roomName) {
        return await this.gameLobbyStore.getPlayerCount(roomName);
    }
}

module.exports = GameLobby;
