class GameLobby {
    // ChatGPT usage: Partial
    constructor(gameManager, gameLobbyStore, io) {
        // this.roomName = roomName;
        // this.gameType = gameType;
        // this.maxPlayers = maxPlayers;
        this.gameManager = gameManager;  
        this.gameLobbyStore = gameLobbyStore;
        this.io = io;
        // this.gameStarted = false;
        // this.players = {};
        // this.counter = 0;  
    }

    // ChatGPT usage: No
    async init(roomName, gameType, maxPlayers, socket) {
        console.log("Lobby created");
        var lobby = await this.gameLobbyStore.getLobby(roomName);
        if(lobby) {
            socket.emit('roomAlreadyExist', "Room already exist");
        }
        else {
            await this.gameLobbyStore.insertLobby(roomName, gameType, maxPlayers);
            socket.emit('lobbyCreated', "Lobby Successfully Created");
        }
    }

    // ChatGPT usage: Partial
    async addPlayer(roomName, userName, bet, socket) {
        console.log("User joined");
        // console.log(this.counter);
        // console.log(this.maxPlayers);
        const lobby = await this.gameLobbyStore.getLobby(roomName);
        if(lobby) {
            if (Object.keys(lobby.players).length < lobby.maxPlayers) {
                lobby.players[userName] = {
                    name: userName,
                    ready: false,
                    bet, 
                    socketId: socket.id
                };
                this.io.to(roomName).emit('newPlayer', userName);
                socket.join(roomName);
                await this.gameLobbyStore.updateLobby(roomName, { players: lobby.players });
            } else {
                socket.emit('PlayerExceedMax', "PlayerExceedMax");
            }
        }
        else {
            socket.emit('roomDoesNot', "Room does not exist");
        }

        // if(this.counter < Number(this.maxPlayers)) {
        //     this.counter++;

        //     this.players[userName] = {
        //         name: userName,
        //         ready: false,
        //         // Initialize bet = 0
        //         bet,
        //         socketId: socket.id
        //     };

        //     this.io.to(this.roomName).emit('newPlayer', userName);

        //     socket.join(this.roomName);

        //     await this.gameLobbyStore.updateLobby(this.roomName, { players: this.players });
        // }
        // else {
        //     socket.emit('PlayerExceedMax', "PlayerExceedMax");
        // }
    }



    // ChatGPT usage: Partial
    async removePlayer(socket) {
        console.log("User left lobby");
        // console.log(this.counter);

        const lobbies = await this.gameLobbyStore.getAllLobby();
        for (let lobby of lobbies) {
            for (let userName in lobby.players) {
                if (lobby.players[userName].socketId === socket.id) {
                    this.io.to(lobby.roomName).emit('playerLeft', userName, lobby.roomName);

                    delete lobby.players[userName];
                    socket.leave(lobby.roomName)
                    await this.gameLobbyStore.updateLobby(lobby.roomName, { players: lobby.players });

                    var result = await this.gameLobbyStore.getPlayerCount(lobby.roomName);
                    this.io.to(lobby.roomName).emit('playerCount', result);
                    console.log("Remove Player successfully");

                    return;
                }
            }
        }

        // this.counter--;
        
        // this.io.to(this.roomName).emit('playerLeft', userName, this.roomName);
        // // this.io.emit('playerLeft', userName, this.roomName);

        // delete this.players[userName];
        // socket.leave(this.roomName);

        // await this.gameLobbyStore.updateLobby(this.roomName, { players: this.players });
        // var result = await this.getPlayerCount(this.roomName);
        // this.io.to(this.roomName).emit('playerCount', result);
        // console.log("Remove Player successfully");
    }

    // ChatGPT usage: Partial
    async setPlayerReady(roomName, userName) {
        console.log("User ready");
        this.io.to(roomName).emit('playerReady', userName);

        await this.gameLobbyStore.setPlayerReady(roomName, userName);

        var result = await this.gameLobbyStore.getPlayerCount(roomName);
        this.io.to(roomName).emit('playerCount', result);

        const lobby = await this.gameLobbyStore.getLobby(roomName);

        if (Object.values(lobby.players).every(player => player.ready)) {
            this.startGame(roomName);
        }


        // this.players[userName].ready = true;

        // this.io.to(this.roomName).emit('playerReady', userName);

        // await this.gameLobbyStore.setPlayerReady(this.roomName, userName);

        // var result = await this.getPlayerCount(this.roomName);
        // this.io.to(this.roomName).emit('playerCount', result);

        // if (Object.values(this.players).every(p => p.ready)) {
        //     this.startGame();
        // }
    }

    // ChatGPT usage: No
    async setPlayerBet(roomName, userName, bet) {
        this.io.to(roomName).emit('setBet', userName);
        
        await this.gameLobbyStore.setPlayerBet(roomName, userName, bet);
    }

    async sendChatMessage(roomName, userName, message) {
        console.log("Send chat Live");
            const chatMessage = {
                user: userName,
                text: message,
            };

        this.io.to(roomName).emit('receiveChatMessage', chatMessage);
    }

    // ChatGPT usage: Partial
    async startGame(roomName) {
        const lobby = await this.gameLobbyStore.getLobby(roomName);
        if (this.gameManager) {
            lobby.gameStarted = true;
    
            this.io.to(roomName).emit('gameStarted');
    
            await this._delay(3000); //Let the front ends setup their listeners
    
            const readyPlayers = Object.keys(lobby.players).filter(userName => lobby.players[userName].ready);
    
            const bets = {};
            for (let userName of readyPlayers) {
                bets[userName] = lobby.players[userName].bet;
            }

            await this.gameManager.startGame(roomName, lobby.gameType, readyPlayers, bets);
    
            for (let userName of readyPlayers) {
                lobby.players[userName].ready = false;
            }
    
            await this.gameLobbyStore.updateLobby(roomName, { players: lobby.players, gameStarted: lobby.gameStarted });
        } else {
            console.log("GameManager not initialized.");
        }




        // if (this.gameManager) {
        //     this.gameStarted = true;

        //     this.io.to(this.roomName).emit('gameStarted');

        //     await this._delay(3000); //Let the front ends setup their listeners

        //     const readyPlayers = Object.keys(this.players).filter(userName => this.players[userName].ready);

        //     const bets = {};
        //     for (let userName of readyPlayers) {
        //         bets[userName] = this.players[userName].bet;
        //     }
        //     await this.gameManager.startGame(this.roomName, this.gameType, readyPlayers, bets);



        //     for (let userName of readyPlayers) {
        //         this.players[userName].ready = false;
        //     }

        //     await this.gameLobbyStore.updateLobby(this.roomName, { players: this.players, gameStarted: this.gameStarted });
        // } else {
        //     console.log("GameManager not initialized.");
        // }
    }

    // ChatGPT usage: No
    async getLobby(roomName) {
        return await this.gameLobbyStore.getLobby(roomName);
    }

    // ChatGPT usage: No
    async getAllLobby(socket) {
        var myLobbies = await this.gameLobbyStore.getAllLobby();
        socket.emit('AllLobby', myLobbies);
        return myLobbies;
    }

    // ChatGPT usage: No
    async deleteLobby(roomName) {
        await this.gameLobbyStore.deleteLobby(roomName);
    }

    // ChatGPT usage: No
    async getPlayerCount(roomName) {
        var result = await this.gameLobbyStore.getPlayerCount(roomName);
        this.io.to(roomName).emit('playerCount', result);
        return result;
    }

    // ChatGPT usage: No
    async _delay(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }
}

module.exports = GameLobby;
