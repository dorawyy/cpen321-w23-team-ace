const keys = require('../data/keys.json'); 
const APIKEY = keys.random_org_key; 
const fetch = require('node-fetch');

class gameAssets {
    /** return a 0-36 roulette table's location maped to colour
    @return {array} rouletteTable: a 0-36 table with colour
    */
   // ChatGPT usage: No
    static getRoulette() {
        return [
            'green',
            'red',
            'black',
            'red',
            'black',
            'red',      // 5
            'black',
            'red',
            'black',
            'red',
            'black',    //10
            'black',
            'red',
            'black',
            'red',
            'black',
            'red',
            'black',
            'red',
            'red',
            'black',
            'red',
            'black',
            'red',
            'black',
            'red',
            'black',
            'red',
            'black',
            'black',
            'red',
            'black',
            'red',
            'black',
            'red',
            'black',
            'red'
        ]   // a 0-36 table  
    }
    /** return a set of Pokar cards
    @param {boolean} addJockers: if true, add jockers to the set
    @return {array} pokar: a set of pokar cards
    */
   // ChatGPT usage: No
    static getPokar(addJockers = false) {
        let pokarSet = []
        if (addJockers) {
            pokarSet = [    // 54 cards
                '2H', '2D', '2C', '2S',
                '3H', '3D', '3C', '3S',
                '4H', '4D', '4C', '4S',
                '5H', '5D', '5C', '5S',
                '6H', '6D', '6C', '6S',
                '7H', '7D', '7C', '7S',
                '8H', '8D', '8C', '8S',
                '9H', '9D', '9C', '9S',
                '10H', '10D', '10C', '10S',
                'JH', 'JD', 'JC', 'JS',
                'QH', 'QD', 'QC', 'QS',
                'KH', 'KD', 'KC', 'KS',
                'AH', 'AD', 'AC', 'AS',
                'bigJoker', 'smallJoker'
            ]
        } else {
            pokarSet = [    // 52 cards
                '2H', '2D', '2C', '2S',
                '3H', '3D', '3C', '3S',
                '4H', '4D', '4C', '4S',
                '5H', '5D', '5C', '5S',
                '6H', '6D', '6C', '6S',
                '7H', '7D', '7C', '7S',
                '8H', '8D', '8C', '8S',
                '9H', '9D', '9C', '9S',
                '10H', '10D', '10C', '10S',
                'JH', 'JD', 'JC', 'JS',
                'QH', 'QD', 'QC', 'QS',
                'KH', 'KD', 'KC', 'KS',
                'AH', 'AD', 'AC', 'AS',
            ]
        }
        return pokarSet;
    }

    /** return the numerical value of the card
    * a = 1, j = 11, q = 12, k = 13
    * small joker = 100, big jokar = 101
    * @param {str} card: the card to be calculated, one defined in getPokar()
    * @return {int} value: the value of the card
    */
    // ChatGPT usage: No
    static getPokarFaceValue(card) {
        let value = 0;
        if (card.includes('Joker')) {
            value = card.includes('big') ? 101 : 100;
        } else {
            switch (card[0]) {
                case 'A':
                    value = 1;
                    break;
                case 'J':
                    value = 11;
                    break;
                case 'Q':
                    value = 12;
                    break;
                case 'K':
                    value = 13;
                    break;
                default:
                    value = parseInt(card, 10);
            }
        }
        return value;
    }

    /**
    * Get random number(s) by calling an API
    * This service will attempt to generate true random numbers if possible
    * @param {int} min: The minimum number (inclusive)
    * @param {int} max: The maximum number (inclusive)
    * @param {int} count: The number of random numbers to generate, if <=0 default to 1
    * @param {string} apiKey: The API key to use. If not provided, the default API key will be used
    * @return {array} value: random numbers
    */

    // ChatGPT usage: No
    static async getRandomNumber(min, max, count, callback, apiKey="") {
        let randomNums = [];
        // input value check
        if (apiKey == "") {
            apiKey = APIKEY;
        }
        if (count <= 0) {
            count = 1;
        }

        // generateIntegers: https://api.random.org/json-rpc/2/basic
        const body = {
            "jsonrpc": "2.0",
            "method": "generateIntegers",
            "params": {
                "apiKey": apiKey,
                "n": count,
                min,
                max,
            },
            "id": 1
        };

        const headers = {'Content-Type':'application/json'}

        for (let i = 0; i < 2; i++) {
            try {
                let response = await fetch('https://api.random.org/json-rpc/1/invoke', {
                    method: 'post',
                    body: JSON.stringify(body),
                    headers
                });
                //console.log('Response status:', response.status, response.statusText);
                let json = await response.json();
                //console.log(json);
    
                // Check if the api returned the random numbers
                if (json && json.result && json.result.random && json.result.random.data) {
                    randomNums = json.result.random.data;
                    //console.log("RANDOM NUMS!");
                    //console.log(randomNums);
                    break;
                } else {
                    throw new Error('No valid random numbers returned');
                }
            } catch (error) {
                console.log('Error occurred while calling the RNG API:', error);
            }
        }
        
        // If the API does not return random numbers in two attempts, use Math.random()
        if (randomNums.length === 0) {
            for (let i = 0; i < count; i++) {
                randomNums.push(Math.floor(Math.random() * (max - min + 1)) + min);
            }
        }
    
        return randomNums;
    }
}

module.exports = gameAssets;
