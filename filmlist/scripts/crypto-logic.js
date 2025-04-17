const alphabet = 'ä(y@–76"µ$xQu<A,VüXC1RO%jJ\\?WlÜD:0~c{TMPE>_ẞ°B}]vwtdp§+&^5e!-zöN[ G.\'kqYZfÄ€n34b8ÖLSßr;h9|IsaomKF=#giHU2/*)'

function getHash(password, salt) {
    let stringToHash = password + salt
    let sum = 0
    for (const char of stringToHash) {
        const indexInDict = alphabet.indexOf(char)
        if (indexInDict == -1)
            continue
        sum += indexInDict + 1
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
    let resultMessage = ''
    for (const char of message) {
        const indexInDict = alphabet.indexOf(char)
        if (indexInDict == -1) {
            resultMessage += char
            continue
        }
        const newIndex = (indexInDict + offset) % alphabet.length
        resultMessage += alphabet[newIndex]
    }

    return resultMessage
}

function reverseVigenere(message, password, startingIndex) {
    const inversePassword = getInversePassword(password)
    return vigenere(message, inversePassword, startingIndex)
}

function getInversePassword(password) {
    // map every symbol in password to the symbol that shifts by the same amount backwards
    let inversePassword = ''
    for (const char of password) {
        const index = alphabet.indexOf(char)
        if (index == 0 || index == -1) {
            inversePassword += char
            continue
        }
        inversePassword += alphabet.charAt(alphabet.length - index)
    }
    return inversePassword
}