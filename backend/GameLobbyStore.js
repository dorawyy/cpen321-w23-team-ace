const { MongoClient } = require('mongodb');

class GameLobbyStore {
    // ChatGPT usage: Partial
    constructor(connectionString, dbName) {
        this.client = new MongoClient(connectionString);
        this.database = dbName;
        this.collection = null;
    }

    // ChatGPT usage: No
    async init() {
        await this.client.connect();
        
        this.database = this.client.db(this.database);
        this.collection = this.database.collection('lobbies');
    }

    // ChatGPT usage: Partial
    async insertLobby(roomName, gameType, maxPlayers) {
        const lobbyData = {
            roomName: roomName,
            gameType: gameType,
            gameStarted: false,
            maxPlayers: maxPlayers,
            players: {}
        };
        await this.collection.insertOne(lobbyData);
        console.log("Insert lobby successfully");
    }

    // ChatGPT usage: No
    async updateLobby(roomName, updateData) {
        await this.collection.updateOne({ roomName: roomName }, { $set: updateData });
        console.log("Update lobby successfully");
    }

    // ChatGPT usage: No
    async setPlayerReady(roomName, userName) {
        const key = `players.${userName}.ready`;
        await this.collection.updateOne({ roomName: roomName }, { $set: { [key]: true } });
        console.log("Set ready successfully");
    }

    // ChatGPT usage: Partial
    async getLobby(roomName) {
        return await this.collection.findOne({ roomName: roomName });
    }

    // ChatGPT usage: No
    async getAllLobby() {
        return await this.collection.find().toArray();
    }

    // ChatGPT usage: No
    async deleteLobby(roomName) {
        await this.collection.deleteOne({ roomName: roomName });
    }

    // ChatGPT usage: No
    async setPlayerBet(roomName, userName, bet) {
        const key = `players.${userName}.bet`;
        await this.collection.updateOne({ roomName: roomName }, { $set: { [key]: bet } });
        console.log("Set bet successfully");
    }

    // ChatGPT usage: No
    async getPlayerCount(roomName) {
        const lobby = await this.collection.findOne({ roomName: roomName });
        return Object.keys(lobby.players).length;
    }

    // ChatGPT usage: No
    async close() {
        await this.client.close();
    }
}

module.exports = GameLobbyStore;