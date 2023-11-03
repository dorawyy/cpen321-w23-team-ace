
const { info } = require('console');
const socketio = require('socket.io');
const Baccarat = require('./Baccarat'); 
const Blackjack = require('./Blackjack');
const Roulette = require('./Roulette');
const EventEmitter = require('events');
const { MongoClient } = require('mongodb');
const { get } = require('http');

/*
playerList structure: 
[
    playerId (str)
]
*/

/*
playerAction structure: 
{
    playerId: [status (int), action (any) (will be processed by game object), action2, ...],
    # status 0: not turn (no actions attached), 1: action chosen, 2: default action (no actions attached)
}
*/

/* betsPlaced, duplicate bet is allowed, ie betting two roulette numbers, changes depending on game type.
Roulette
{
    playerId: {"red": val, "black": val, "odd": val, "even": val, "green", val}
}

Baccarat
{
    playerId: {"win": "PlayersWin" or "DealerWins or "tie", "amount": val}]"} 
}

BlackJack
{
    playerId: val
}
*/

/* gameResult
{
    playerId: amount (float)
}
*/

/*gameItems
{
    globalItems: {
        ITEM_NAME: ITEM_VALUE (any),
    },
    playerItems: {
        PLAYER_NAME: {
            ITEM_NAME: ITEM_VALUE (any),
        },
    },
}

/*gameData structure: must be fully JSON serializable
{
    // unique id for the lobby
    lobbyId: lobbyId (string),          
    // blackjack, baccarat, roulette
    gameType: gameType (string),        
    // list of players in the game, see above for structure
    playerList: playerList (list),      
    // index of the current player in playerList >=0, <= len(playerList)
    currentPlayerIndex: 0 (int),        
    // current turn number >=0
    currentTurn: 0 (int),              
    // dictionary of bets placed by players, see above for structure
    betsPlaced: betsPlaced (dictionary),            
    // dictionary of game objects, see above for structure
    gameItems: defaultGameObjects (dictionary),     
};
*/

/* 
@requirement: lobbyId to be unique
@requirement: gameType be one of the supported types (see above)
@requirement: playerId in side playerList if unique
@requirement: gameData should not be modified outside of the gameManager class
*/
class GameManager extends EventEmitter {
    /* create a new game manager
    the game manager controls all games being currently player
    it utilizes a database for storing game information and will communicate with the frontend
    @param {socketio} io: the socketio object
    gameData is the main data structure (fixed format dictionary) that will be used as
        main communication variable between functions
    */
    
    // ChatGPT usage: Partial - passing in the io object
    constructor(io) {
        super();
        this.io = io;
        this.gameStore = new GameStore();
        this.timers = {};
    }

    /* create/reset the turn timer for one single game
    *   @param {dictionary} gameData
    *   @return (int) 1 for success, -1 for fail
    */
   // ChatGPT usage: No
    _resetTimer(gameData) {
        // reset the timer, if one exists
        if (this.timers[gameData.lobbyName]) {
            clearTimeout(this.timers[gameData.lobbyName]);
        }
 
        // Implement actual timeout
        this.timers[gameData.lobbyName] = setTimeout(() => {
            //Force them to stand
            this.playTurn(gameData, gameData.playerList[gameData.currentPlayerIndex], "stand");;
        }, 15000); // 15 seconds
    }

    /* based on player action, get the consequence
    *   @param {dictionary} gameData
    *   @param {dictionary} playerAction
    *  @return {dictionary} gameData
    */
   // ChatGPT usage: No
    async _getActionResult(gameData, username, action) {
        console.log("GETTING ACTION RESULT")
        let gameType = gameData.gameType;
        console.log(gameType)
        if (gameType == 'BlackJack') {
            gameData = await Blackjack.playTurn(gameData, username, action);
        }
        else if (gameType == 'Baccarat') {
            gameData = await Baccarat.playTurn(gameData);
        }
        else if (gameType == 'Roulette'){
            console.log("GETTING ROULETTE RESULT")

            gameData = await Roulette.playTurn(gameData);
        }
        
        return gameData;
    }

    /* based on game status, calculate the winning and modify gameData
    *   @param {dictionary} gameData
        @modify {dictionary} gameData
    * @return {dictionary} gameResult
    *   return 0 on error, like if game not over
    */
   // ChatGPT usage: No
    _calculateWinning(gameData) {
        if (gameData.currentPlayerIndex !== -1) {
            return 0;
        }
        let gameType = gameData.gameType;
        let gameResult = null;
        if (gameType == 'Blackjack') {
            gameResult = Blackjack.calculateWinning(gameData);
        }
        else if (gameType == 'Baccarat') {
            gameResult = Baccarat.calculateWinning(gameData);
        }
        else if (gameType == 'Roulette') {
            gameResult = Roulette.calculateWinning(gameData);
        }
        
        return gameResult;
    }

    /* get the default action for the current player
        gameData.currentTurn will be updated
        gameData.currentPlayerIndex will be updated to next player, or -1 if game is over
    *   @param {dictionary} gameData
    *   @return {dictionary} defaultAction
    */
   // ChatGPT usage: No
    _getDefaultAction(gameData) {
        let defaultAction = {};
        for (let i = 0; i < gameData.playerList.length; i++) {
            defaultAction[gameData.playerList[i]] = {
                                                        'status':  0, 
                                                        'action': "none",
                                                    };
        }
        return defaultAction;
    }


    /* create a new game by creating a new gameData object
    *  @param (string) lobbyId
    *  @param (string) gameType
    *  @param {dictionary} playerList
    *  @emit {dictionary} gameData back to caller
    */

    // ChatGPT usage: No
    async startGame(lobbyId, gameType, playerList, betsPlaced) {
        console.log("STARTING NEW GAME");

        let defaultItems = {};
        for (let i = 0; i < playerList.length; i++) {
            //defaultItems.playerList[i].playerId = {};
            defaultItems[playerList[i]] = {};
        }

        // setup game object with default value
        let gameData = {
            lobbyId: lobbyId,
            gameType: gameType,
            playerList: playerList,
            currentPlayerIndex: 0,
            currentTurn: 0,
            betsPlaced: betsPlaced,
            gameItems: {
                globalItems: {}, 
                playerItems: defaultItems
            },
        };

        // setup new game based on game type
        if (gameType == "Blackjack") {
            gameData = Blackjack.newGame(gameData);
        } else if (gameType == "Baccarat") {
            gameData = Baccarat.newGame(gameData);
        } else if (gameType == "Roulette") {
            gameData = Roulette.newGame(gameData);
        }
        
        console.log("SPOT 1")
        // complete game creation, will prepare the game settings, but no action will be performed
        await this.gameStore.newGame(gameData);

        console.log("SPOT 2")

        this.playTurn(gameData.lobbyId);
    }


    /* play a single turn in the game
    *   @param {dictionary} lobbyId
    *   @param {dictionary} action
    *  @emit {dictionary} gameData back to caller
    * @emit {dictionary} action back to caller
    */
   // ChatGPT usage: No
    async playTurn(lobbyId, username="none", action="none") {
        console.log("SPOT 3")

        let gameData = await this.gameStore.getGame(lobbyId);
        let gameResult = null;

        console.log("PLAYING TURN")
        console.log(gameData)

        // get action
        gameData = await this._getActionResult(gameData, username ,action);

        // update the game data in the database
        //await this.gameStore.updateGame(gameData);
        
        // Notify all players whose turn it is
        if (this._checkGameOver(gameData)) {

            gameResult = this._calculateWinning(gameData);

            //console.log("Calculated Winnings")
            //console.log(gameData.gameItems.globalItems.ballLocation)
            //console.log(gameResult)
            
            // game is over
            this.io.to(gameData.lobbyId).emit('gameOver', {
                "gameData": gameData, 
                "gameResult": gameResult,
            
            });

            console.log("EMITTED GAME OVER")
            
            if (this.timers[gameData.lobbyName]) {
                clearTimeout(this.timers[gameData.lobbyName]);
            }

            //await this.gameStore.deleteGame(gameData.lobbyId);
            
        } else {
            //game not over
            this.io.to(gameData.lobbyId).emit('playerTurn', {
                "gameData": gameData, 
            });
            // reset the timer, if one exists
            if (gameData.gameType == "BlackJack") {
                this._resetTimer(gameData);
            }
        }
        
    }

    /* check if the game is over
    *   @param {dictionary} gameData
    *   @return {boolean} true if game is over, false if not
    */
   // ChatGPT usage: No
    _checkGameOver(gameData) {
        // if there is no more player index, game is over
        return gameData.currentPlayerIndex == -1;
    }


    // ChatGPT usage: No
    async connect() {
        await this.gameStore.connect();
    }
}

// Basic outline for GameStore:
class GameStore {
    // ChatGPT usage: No
    constructor() {
        this.client = new MongoClient("mongodb://127.0.0.1:27017");
    }

    // ChatGPT usage: No
    async connect() {
        try {
            await this.client.connect()
            this.db = this.client.db('casinoApp');
            this.games = this.db.collection('games');
            console.log("Connected to gameStore database");
        } catch(err) {
            console.log(err);
            await this.client.close();
        }
        
    }

    /* create a new game by creating a new gameData object
    *  @param {dictionary} gameData
    *  @return {dictionary} gameData
    */
   // ChatGPT usage: No
    async newGame(gameData) {
        return await this.games.insertOne(gameData);
    }

    /* using a lobbyName, set the gameData object
    *   @param (string) lobbyName
    *   @return {dictionary} gameData
    */
   // ChatGPT usage: No
    async getGame(lobbyName) {
        return await this.games.findOne({ lobbyId: lobbyName });
    }

    /* save/update the gameData object, replacing the existing information
    *   @param {dictionary} gameData
    *   @return {dictionary} gameData
    */
   // ChatGPT usage: No
    async updateGame(gameData) {
        return await this.games.updateOne(
            { lobbyId: gameData.lobbyId }, 
            { $set: gameData }
        );
    }

    // ChatGPT usage: No
    async deleteGame(lobbyName) {
        return await this.games.deleteOne({ lobbyId: lobbyName });
    }
}

module.exports = GameManager;