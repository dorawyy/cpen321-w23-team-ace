
/** A mongodb input validator, ensures data security against injection attacks
 * the function will return true if
 * 1. type test match (one in input list)
 * 2. do not start with "$"
 * 3. if of object, null is accepted. 
 * @param {*} variable a variable to be tested
 * @param {string|list} types a list of types to be tested, or a string of one type, can be 'string', 'object', 'number', 'boolean'
 * @returns {boolean} true if pass all test, false otherwise
 */
function mongoShield(variable, types = ['string', 'object']) {
    // if user input a string, turn it into list
    if (typeof types === 'string') {
        types = [types];
    }
    //handle object type
    if (typeof variable === 'object' && types.includes('object')) {
        // turn input to string
        let variableString = JSON.stringify(variable);
        
        // general testing, checks all body for $ as DB may return /query partial body
        // we need to make sure we protect against injection attack with $ in middle of body
        if (variableString.includes('$')) {
            return false;
        } else {
            return true;
        }
    }
    //exlcude object in type
    types = types.filter(type => type !== 'object');
    // return false if type mismatch or include $
    if (!types.includes(typeof variable)) {
        return false;
    }
    variable = String(variable);
    if (variable.includes('$')) {
        return false;
    }
    return true;
}

module.exports = mongoShield;