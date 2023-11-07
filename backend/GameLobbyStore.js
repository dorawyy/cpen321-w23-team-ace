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
        console.log("Connected to gameLobbyStore db");

    }

    // ChatGPT usage: Partial
    async insertLobby(roomName, gameType, maxPlayers) {
        const lobbyData = {
            roomName,
            gameType,
            gameStarted: false,
            maxPlayers,
            players: {}
        };
        await this.collection.insertOne(lobbyData);
        console.log("Insert lobby successfully");
    }

    // ChatGPT usage: No
    async updateLobby(roomName, updateData) {
        await this.collection.updateOne({ roomName }, { $set: updateData });
        console.log("Update lobby successfully");
    }

    // ChatGPT usage: No
    async setPlayerReady(roomName, userName) {
        const key = `players.${userName}.ready`;
        await this.collection.updateOne({ roomName }, { $set: { [key]: true } });
        console.log("Set ready successfully");
    }

    // ChatGPT usage: Partial
    async getLobby(roomName) {
        return await this.collection.findOne({ roomName });
    }

    // ChatGPT usage: No
    async getAllLobby() {
        return await this.collection.find().toArray();
    }

    // ChatGPT usage: No
    async deleteLobby(roomName) {
        await this.collection.deleteOne({ roomName });
    }

    // ChatGPT usage: No
    async setPlayerBet(roomName, userName, bet) {
        const key = `players.${userName}.bet`;
        await this.collection.updateOne({ roomName }, { $set: { [key]: bet } });
        console.log("Set bet successfully");
    }

    // ChatGPT usage: No
    async getPlayerCount(roomName) {
        const lobby = await this.collection.findOne({ roomName });
        var totalPlayers = 0;
        var playersReady = 0;

        for (var player in lobby.players) {
            totalPlayers++;
        if (lobby.players[player].ready) {
            playersReady++;
        }
    }
        // Return number of total players and ready players
        return {"tp": totalPlayers, "pr": playersReady};
    }

    // ChatGPT usage: No
    async close() {
        await this.client.close();
    }
}

module.exports = GameLobbyStore;
