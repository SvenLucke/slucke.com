const alphabet = 'A-BC=0D"EFG<HI}1!J:KL$MN\'O2P_QR\n]STU(3V.W*XYZÄ#4)?Ö&[Üẞabc>5d§efg–hi6jkl~mno7pq,rs%{tu+8vw;xy/zä9ö\\üß'
const salt = 'bÖsno/H*'
const expectedHash = 598546911

document.getElementById('password').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('the-button').click();
    }
  }); 

document.getElementById("the-button").onclick = function() {
    const password = document.getElementById('password').value
    if (password == '') 
        return
    const hashedPass = getHash(password)
    console.log('hash: ' + hashedPass)
    if (hashedPass != expectedHash) {
        document.getElementById('password').value = ''
        return
    }

    let cells = document.getElementsByTagName('tbody')
    for (let index = 0; index < cells.length; index++) {
        const element = cells[index];
        element.innerHTML = vigenere(element.innerHTML, password)
    }
}

function getHash(password) {
    let currentVal = password + salt;
    let sum = 0;
    for (let index = 0; index < currentVal.length; index++) {
        const indexInDict = alphabet.indexOf(currentVal[index]);
        if (indexInDict == -1) 
            continue
        sum += indexInDict
        sum *= 3001
        sum %= 1e9 + 9
    }
    return sum
}

function vigenere(message, password) {
    let resultString = ''
    for (let index = 0; index < message.length; index++) {
        const char = message[index];
        const offset = alphabet.indexOf(password[index % password.length])
        resultString += caesar(char, offset)
    }
    return resultString
}

function caesar(message, offset) {
    console.log(message + ' ' + offset)
    return message.toString().split('').map(char => {
        const indexInDict = alphabet.indexOf(char)
        if (indexInDict == -1) 
            return char
        const newIndex = (indexInDict + offset) % alphabet.length
        return alphabet[newIndex]
    }).join('')
}