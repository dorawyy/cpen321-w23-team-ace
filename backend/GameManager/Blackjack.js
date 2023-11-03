/*
1. Blackjack is a card game played between the House (dealer) and the players. The dealer deals two cards to each player and two to themselves, with one facing up and one facing down.

2. The objective of the game is to beat the dealer's hand without exceeding a total point value of 21. The value of each card is as follows: 2-10 (as it is), Jack, Queen, King (each worth 10 points) and Ace (either 1 or 11, if adding 11 breaks 21, it's counted as 1).

3. After receiving the first two cards, players can choose to "Stand" (keep their current cards), "Hit" (receive another card)

4. Once all players have completed their turns, it's the dealer's turn. The dealer must always hit until they have a total of 17 or higher.

5. If the player's hand exceeds 21 (busting), they automatically lose, no matter what the dealer's hand is.

6. The game continues with players trying to reach a score of 21 or as close to 21 as possible, without going over.

Winning:
1. If the player has Blackjack (an Ace and a 10-point card as their first two cards) and the dealer does not, the player automatically wins

2. If the player has a final sum closer to 21 and it is higher than the dealer’s total, or if the dealer goes over 21 (busts), the player wins.

3. If both, the player and dealer, have the same point value in their hands, it is a tie

4. If the dealer's hand is closer to 21 or the player's hand goes over 21 (bust), the player loses the bet placed.

Unique:
in this version of the game, dealer will be computer and will stop whenever he hit 17+ or bust
*/

const GameAssets = require('./GameAssets'); 

class Blackjack {
    // ChatGPT usage: No
    static newGame(gameData){
        let gameDataLocal = JSON.parse(JSON.stringify(gameData))
        
        gameDataLocal.gameItems.globalItems = {
            pokar: GameAssets.getPokar(),
            dealerHand: [],
        };
        // for each player, setup their hand
        for (let i = 0; i < gameDataLocal.playerList.length; i++) {
            gameDataLocal.gameItems.playerItems[gameDataLocal.playerList[i]] = {
                playerHand: [],
                playerState: 0, // 0 = still in game, 1 = done their turns
            }
        }
        return gameDataLocal;
    }


    /* get a random card from the deck
    @param {json/object} gameData: the gameData object
    @return {str} card: the card generated, see getPokar() for values
    */
   // ChatGPT usage: No
    static async _getRandomCard(gameData) {
        let randomIndex = (await GameAssets.getRandomNumber(0, 51, 1))[0]
        //get a random card
        return gameData.gameItems.globalItems.pokar[randomIndex];
    }

    /* get the value of the hand
    @param {json/object} gameData: the gameData object
    @return {json} handValue: the value of the player and banker hand 
        {"PLAYERNAME": val (int)), "PLAYERNAME": val (int)), ...,  "bankerScore": (int)}
    */
    // ChatGPT usage: No
    static _getHandValue(gameData) {
        let playerScore = 0;
        let dealerScore = 0;
        let cardValue = 0;
        let aceCount = 0
        let returnObject = {}

        //get the value of the dealer hand
        for (let card of gameData.gameItems.globalItems.dealerHand) {
            cardValue = GameAssets.getPokarFaceValue(card);
            // ignore card 10-13 (0)
            if (cardValue >= 9) {
                dealerScore += 10
            } else {
                dealerScore += cardValue
            }
        }

        //Check 1 at a time if Aces can be 11 instead of 1. 
        for (let card of gameData.gameItems.globalItems.dealerHand) {
            cardValue = GameAssets.getPokarFaceValue(card);
            if ((cardValue == 1) && (dealerScore + 10 <= 21)) {
                dealerScore += 10
            } 
        }

        returnObject["dealerScore"] = dealerScore;


        for (let playerId of gameData.playerList) {
            playerScore = 0;
            aceCount = 0;

            //get the value of the player hand
            for (let card of gameData.gameItems.playerItems[playerId].playerHand) {
                cardValue = GameAssets.getPokarFaceValue(card);
                // ignore card 10-13 (0)
                if (cardValue >= 9) {
                    playerScore += 10
                } else {
                    playerScore += cardValue
                }
            }

            //Check 1 at a time if Aces can be 11 instead of 1. 
            for (let card of gameData.gameItems.playerItems[playerId].playerHand) {
                cardValue = GameAssets.getPokarFaceValue(card);
                if ((cardValue == 1) && (playerScore + 10 <= 21)) {
                    playerScore += 10
                } 
            }

            returnObject[playerId] = playerScore;
        }
        
        return returnObject;
    }

    /** play a turn of the game
    for blackjack, this gets if player hit or not and determine next player
    @param {json} gameData: the gameData object
    @return {json} gameData: the gameData object with the next player
        return 0 on error
    */
    // ChatGPT usage: No
    static async playTurn(gameData, username, action) {
        let gameDataLocal = JSON.parse(JSON.stringify(gameData))
        // check if more card should be given
        console.log("PLAY TURN : " + JSON.stringify(gameData));
        
        let playerHand = [];
        let dealerHand = [];
        let handValue = [];
        
        // if first round, deal cards
        if (gameDataLocal.currentTurn === 0) {
            gameDataLocal.currentTurn = 1;

            // deal cards to all player
            for (let playerId of gameDataLocal.playerList) {
                playerHand.push(await this._getRandomCard(gameDataLocal));
                playerHand.push(await this._getRandomCard(gameDataLocal));
                gameDataLocal.gameItems.playerItems[playerId]["playerHand"] = playerHand;
            }
            // deal cards to dealer
            dealerHand.push(await this._getRandomCard(gameDataLocal));
            gameDataLocal.gameItems.globalItems["dealerHand"] = dealerHand;

        } else {

            if (username !== gameDataLocal.playerList[gameDataLocal.currentPlayerIndex]) {
                //Wrong player somehow made the request
                return gameDataLocal;
            }

            console.log("NEW ACTION: " + action);
            if (action === "hit") {
                playerHand = gameDataLocal.gameItems.playerItems[username].playerHand;
                playerHand.push(await this._getRandomCard(gameDataLocal));
                handValue = this._getHandValue(gameDataLocal);

                if (handValue[username] >= 21) {
                    //Their turn is over
                    console.log("PLAYER BUSTED OR HIT 21")
                    gameDataLocal.gameItems.playerItems[username].playerState = 1;
                    gameDataLocal.currentTurn = gameDataLocal.currentTurn + 1;
                }
            } else if (action === "stand") {
                //Their turn is over
                gameDataLocal.gameItems.playerItems[username].playerState = 1;
                gameDataLocal.currentTurn = gameDataLocal.currentTurn + 1;
            } else {
                //bad action
                return gameDataLocal;
            }
        }

        // get next player, and determine if game is over
        console.log("GET NEXT PLAYER: " + gameDataLocal.currentPlayerIndex)
        gameDataLocal = this._getNextPlayer(gameDataLocal);     
        console.log("GOT NEXT PLAYER: " + gameDataLocal.currentPlayerIndex)
   

        // if user all made action, dealer will play\
        if (gameDataLocal.currentPlayerIndex === -1){
            // dealer will play
            console.log("DEALER's TURN")
            handValue = this._getHandValue(gameDataLocal);
            while (handValue.dealerScore < 17) {
                gameDataLocal.gameItems.globalItems["dealerHand"].push(await this._getRandomCard(gameDataLocal));
                handValue = this._getHandValue(gameDataLocal);
            }
        }

        return gameDataLocal;
    }

    /**
     * calculate the winning amount of each player
     * @param {*} gameData: the gameData object 
     * @returns {json} gameResult: the amount of money each player wins
     */
    // ChatGPT usage: No
    static calculateWinning(gameData){
        // ensure game is over
        if(gameData.currentPlayerIndex !== -1){
            return 0;
        }

        let gameDataLocal = JSON.parse(JSON.stringify(gameData))
        let handValue = this._getHandValue(gameDataLocal);
        // prepare returning object
        let gameResult = {}
        for (let i = 0; i < gameDataLocal.playerList.length; i++) {
            gameResult[gameDataLocal.playerList[i]] = "";
        }
        // get bets placed by each player
        for (let i = 0; i < gameDataLocal.playerList.length; i++) {
            let playerIdValue = gameDataLocal.playerList[i];
            let playerBets = gameDataLocal.betsPlaced[playerIdValue];
            let winningAmount = 0;

            let betType = "self"; //Currently the only FE option
            let betValue = playerBets; //integer
            
            //Calculate bet result
            winningAmount += this._didBetWin(betType, handValue, betValue);
            
            gameResult[playerIdValue] = winningAmount;
        }
        return gameResult;
    }


    /**
     * determine if a bet won
     * @param {*} betType: the type of bet placed
     * @param {*} handValue: the value of the player and banker hand
     * @param {*} betValue: the amount of money placed on the bet
     * @returns {int} winningAmount: the amount of money the player wins
     */
    // ChatGPT usage: No
    static _didBetWin(betType, handValue, betValue){
        let winningAmount = -betValue;
        if (betType === "self") {
            if (handValue.playerScore > 21) {
                winningAmount += 0;
            } else {
                if (handValue.playerScore === 21 || handValue.playerScore > handValue.dealerScore) {
                    winningAmount += betValue * 2;
                }  else if (handValue.playerScore === handValue.dealerScore) {
                    winningAmount += betValue;
                }
            }
        } 
        return winningAmount;
    }

    /**
     * Get the next player that is still in the game
     * @param {*} gameData: the gameData object 
     * @returns {json} gameData: the gameData object with the next player
     */
    // ChatGPT usage: No
    static _getNextPlayer(gameData){
        let playerId = "";
        let playerCount = gameData.playerList.length;
        

        for (let i = 0; i < playerCount; i++) {
            playerId = gameData.playerList[i];
            if (gameData.gameItems.playerItems[playerId].playerState === 0) {
                gameData.currentPlayerIndex = i;
                return gameData;
            }
        }

        // If still no player found, set currentPlayerIndex to -1
        gameData.currentPlayerIndex = -1;
        return gameData;
    }
}

module.exports = Blackjack;