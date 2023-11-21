
/**
 * the function will return true if
 * 1. type test match (one in input list)
 * 2. do not start with "$"
 * 3. if of object, null is accepted. 
 * @param {*} variable a variable to be tested
 * @param {string|list} types a list of types to be tested, or a string of one type, can be 'string', 'object', 'number', 'boolean'
 * @returns 
 */
function mongoShield(variable, types = ['string', 'object']) {
    if (typeof types === 'string') {
        types = [types];
    }
    //handle object type
    if (typeof variable === 'object') {
        // ok if null
        if (variable=== null) {
            return true;
        }
        // turn to string
        variableString = JSON.stringify(variable);
        
        // see if $ in string
        if (variableString.includes('$')) {
            return false;
        } else {
            return true;
        }
        
    }
    // exlcude object in tyoe
    types = types.filter(type => type !== 'object');
    //handle other types
    for (let type of types) {
        if (typeof variable === type && !variable.startsWith('$')) {
            return true;
        }
    }
    return false;
}

module.exports = mongoShield;