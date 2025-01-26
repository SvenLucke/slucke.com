const alphabet = 'ä(y@–76"µ$xQu<A,VüXC1RO%jJ\\?WlÜD:0~c{TMPE>_ẞ°B}]vwtdp§+&^5e!-zöN[ G.\'kqYZfÄ€n34b8ÖLSßr;h9|IsaomKF=#giHU2/*)'

function getHash(password, salt) {
    let currentVal = password + salt
    let sum = 0
    for (let index = 0; index < currentVal.length; index++) {
        const indexInDict = alphabet.indexOf(currentVal[index])
        if (indexInDict == -1)
            continue
        sum += indexInDict
        sum *= 3001
        sum %= 1e9 + 9
    }
    return sum
}

/* 
 * Encrypts the message with the Vigenere algorithm using the given password and
 * starting with the symbol at the given startingIndex of the password. The used
 * alphabet is defined in the beginning of this file.
*/
function vigenere(message, password, startingIndex) {
    let resultString = ''
    for (let index = 0; index < message.length; index++) {
        const charToEncrypt = message[index]
        const shiftingChar = password[(startingIndex + index) % password.length]
        const offset = alphabet.indexOf(shiftingChar)
        resultString += caesar(charToEncrypt, offset)
    }
    return resultString
}

function caesar(message, offset) {
    return message.toString().split('').map(char => {
        const indexInDict = alphabet.indexOf(char)
        if (indexInDict == -1)
            return char
        const newIndex = (indexInDict + offset) % alphabet.length
        return alphabet[newIndex]
    }).join('')
}

function reverseVigenere(message, password, startingIndex) {
    const inversePassword = getInversePassword(password)
    return vigenere(message, inversePassword, startingIndex)
}

function getInversePassword(password) {
    // map every symbol in password to the symbol that shifts by the same amount backwards
    return Array.from(password)
        .map(char => {
            if (char == alphabet[0])
                return char
            return alphabet.charAt(alphabet.length - alphabet.indexOf(char))
        }).join('')
}