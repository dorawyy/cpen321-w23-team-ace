/*
1. The game of Roulette is played on a wheel with numbers ranging from 0 through 36.

2. The primary objective is to predict which number the roulette ball will land on after the wheel is spun.

3. The game table also includes areas for various types of bets: inside bets (single numbers and small combinations of numbers) and outside bets (large number combinations like odd/even, red/black, first/second/third dozen, etc).

4. Single Zero (0) is included in the wheel and it is colored in green, while the numbers from 1-36 alternate between red and black.

5. At the beginning of each round, players place their bets on the table where there are numbers and sections for combination bets.

6. After bets are placed, the roulette wheel is spun, and a small ball is released onto the wheel in the opposite direction of the spin.

7. When the ball lands in a numbered slot on the wheel, the winning number is determined.

8. The bets corresponding to this number win and losing bets are swept off the table.

9. If the winning number is 0, outside bets typically lose unless specifically stated otherwise.

10. Players can make as many bets as they like within the table limit and can spread their bets across various outcomes.

Winning:
1. The payout for winning depends on the type of bet. Single number (Straight up) bets pay 35 to 1, two numbers (Split) pay 17 to 1, three numbers (Street) pay 11 to 1, etc.

2. Bets on the outside chances such as Even or Odd, Red or Black, 1-18 (Low) or 19-36 (High) pay 1 to 1. Bets on Dozens or Columns pay 2 to 1.

3. The casino collects all losing bets and returns the winning bets with their respective payouts, retaining a house edge on each spin.
- The first column covers numbers: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
- The second column covers numbers: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35 
- The third column covers numbers: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36 
- Dozens: The bet covers the first (1-12), second (13-24), or third (25-36) 
*/

const GameAssets = require('./GameAssets'); 

class Roulette{
    
    /** create a new game by modifying the gameData object
    @param {json} gameData: the gameData object
    @return {json} gameData: the gameData object modified
    */
    // ChatGPT usage: No
    static newGame(gameData){
        let gameDataLocal = JSON.parse(JSON.stringify(gameData))
        
        gameDataLocal.gameItems.globalItems = {
            "rouletteTable": GameAssets.getRoulette(),    
            "ballLocation": null,               // the ball location
        };
        return gameDataLocal;
    }

    /** play a turn of the game 
    for roulette, this updates the ball location of global items
    @param {json} gameData: the gameData object
    @return {int} rouletteNumber: the number generated by the roulette
        return 0 on error
    */
    // ChatGPT usage: No
    static async playTurn(gameData){
        // check game is over
        if(gameData.currentPlayerIndex === -1){
            return 0;
        }
        let gameDataLocal = JSON.parse(JSON.stringify(gameData))
        let rouletteNumber = Math.floor((await GameAssets.getRandomNumber(0, 36, 1))[0]); //Generate a random number: 0-36
        gameDataLocal.gameItems.globalItems.ballLocation = rouletteNumber;
        gameDataLocal.currentPlayerIndex = -1; // game over
        return gameDataLocal;
    }

    /** after user placed bet, played a turn, wining amount will be calculated according to the rules
    @param {json} playerBet: the bet placed by the player
    @param {int} rouletteNumber: the number generated by the roulette
    @return {int} winningAmount: the amount of money the player wins
        or 0 on error
    */
    // ChatGPT usage: No
    static calculateWinning(gameData){
        // check game is over
        if(gameData.currentPlayerIndex !== -1){
            return 0;
        }
        let gameDataLocal = JSON.parse(JSON.stringify(gameData))
        let rouletteNumber = gameDataLocal.gameItems.globalItems.ballLocation;
        let landColour = gameDataLocal.gameItems.globalItems.rouletteTable[rouletteNumber];
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
            // for each bet placed by player, calculate each winning amount, ignore no win
            let currentBetOptionsInFE = ["red", "black", "odd", "even", "green"];

            for (let j = 0; j < currentBetOptionsInFE.length; j++) {
                let betType = currentBetOptionsInFE[j];
                let betValue = playerBets[currentBetOptionsInFE[j]];
                winningAmount += this._didBetWin(betType, rouletteNumber, landColour, betValue);
            }
            gameResult[playerIdValue] = winningAmount;
        }
        return gameResult;
    }
    
    /** check if the bet wins, helper function for calculateWinning
    @param {string} betType: the type of bet placed by the player
        accepted types: red, black, odd, even, low, high, firstDozen, secondDozen, thirdDozen, 
            firstColumn, secondColumn, thirdColumn, {single numbers like 0, 1, 2...}
    @param {int} rouletteNumber: the number generated by the roulette
    @param {int} betValue: the amount of money the player bet
    @return {int} winningAmount: the amount of money the player wins
    */
    // ChatGPT usage: No
    static _didBetWin(betType, rouletteNumber, landColour, betValue){
        let winningAmount = -betValue;
        console.log("ROULETTE BET TYPE: " + betType + " ROULETTE NUMBER: " + rouletteNumber + " BET VALUE: " + betValue + " LAND COLOUR: " + landColour);

        if(betType === 'red' || betType === 'black'){
            if(landColour == betType){
                winningAmount += betValue * 2; //Red/Black bet pays 1:1
            }
        }else if(betType === 'odd' || betType === 'even'){
            if((rouletteNumber !== 0 && rouletteNumber % 2 === 0 && betType == 'even') 
                || (rouletteNumber % 2 === 1 && betType === 'odd')){
                winningAmount += betValue * 2; //Odd/Even bet pays 1:1
            }
        }else if(betType === 'low' || betType === 'high'){
            if((rouletteNumber >=1 && rouletteNumber <= 18 && betType === 'low') 
                || (rouletteNumber >=19 && rouletteNumber <= 36 && betType === 'high')){
                winningAmount += betValue * 2; //Low/High bet pays 1:1
            }
        }else if(betType.includes('Dozen')){
            if((rouletteNumber >=1 && rouletteNumber <= 12 && betType === 'firstDozen') 
                || (rouletteNumber >=13 && rouletteNumber <= 24 && betType === 'secondDozen') 
                || (rouletteNumber >=25 && rouletteNumber <= 36 && betType === 'thirdDozen')){
                winningAmount += betValue * 3; //Dozen bet pays 2:1
            }
        }else if(betType.includes('Column')){
            if((rouletteNumber % 3 === 1 && betType === 'firstColumn') 
                || (rouletteNumber % 3 === 2 && betType === 'secondColumn') 
                || (rouletteNumber % 3 === 0 && betType === 'thirdColumn')){
                winningAmount += betValue * 3; //Column bet pays 2:1
            }
        }else if(betType === "green") {
            if (rouletteNumber == 0) {
                winningAmount += betValue * 36; 
            }
        }
       
        console.log("WINNING AMOUNT : " +  winningAmount);
        return winningAmount;
    }

    
}

module.exports = Roulette;