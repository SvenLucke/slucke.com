const alphabet = 'QA-BC=0D"EFG<HI}1!J@:KL$M°N\'O2P_R]STU(3V.W*XYZÄ#4)?Ö&[Üẞ|a^bc>5d§efg–hi6jkl~mno7pq,r€s%{tu+8vw;µxy/zä9ö\\üß'
const salt = 'bÖsno/H*'
const expectedHash = 654460158

window.onload = async function getTBodies() {
    fetch('tbodies.html')
        .then(value => value.text())
        .then(value => document.getElementsByTagName('table')[0].innerHTML += value)
}

document.getElementById('password').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault()
        document.getElementById('decrypt-button').click()
    }
})

document.getElementById('decrypt-button').onclick = function () {
    const password = document.getElementById('password').value
    document.getElementById('password').value = ''
    if (password == '')
        return
    const hashedPass = getHash(password)
    if (hashedPass != expectedHash) {
        document.getElementById('password').value = ''

        if (!document.getElementsByTagName('header')[0].innerText.includes('Wrong password')) {
            let element = document.createElement('text')
            element.setAttribute('style', 'color:red')
            element.innerText = 'Wrong password!'
            document.getElementsByTagName('header')[0].appendChild(element)
        }
        return
    }

    document.getElementsByTagName('header')[0].innerHTML = '<text style="color:green">Welcome!</text>'
    downloadTableAsCsv()

    let cells = Array.from(document.getElementsByClassName('private')).reverse()
    let passwordCursor = 0
    for (let index = 0; index < cells.length; index++) {
        const element = cells[index]
        const message = element.innerText.toString()
        element.innerText = vigenere(message, password, passwordCursor)
        passwordCursor = (passwordCursor + message.length) % password.length
        element.classList.remove('private')
    }
}

function getHash(password) {
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
    // map every symbol in password to the symbol that shifts by the same amount backwards
    const inversePassword = Array.from(password).map(char => alphabet.charAt(alphabet.length - alphabet.indexOf(char))).join('')
    return vigenere(message, inversePassword, startingIndex)
}

function downloadTableAsCsv() {
    const header = Array.from(document.getElementsByTagName('th')).map(colHead => `"${colHead.innerText.toString().replaceAll('\n', '')}"`).join(';')
    const rows = Array.from(document.getElementsByTagName('tr'))
    rows.shift()
    const csvData = rows.map(row => {
        const cells = Array.from(row.getElementsByTagName('td'))
        return cells.map(cell => `"${cell.innerText}"`).join(';')
    }).join('\n')

    const tableContent = header + '\n' + csvData
    let element = document.createElement('a')
    element.setAttribute('href', `data:text/csv,${encodeURIComponent(tableContent)}`)
    element.setAttribute('download', `filmList-${new Date().toISOString().slice(0, 10)}.csv`)

    let button = document.createElement('button')
    button.innerText = 'Download as CSV'
    element.appendChild(button)

    document.getElementsByTagName('header')[0].appendChild(element)
}

async function convertCsvToHtml() {
    if (document.getElementById('filmlist-csv').files.length == 0)
        return

    const parser = new DOMParser()
    const tbodyTemplate = '<tbody></tbody>'

    const fileText = await document.getElementById('filmlist-csv').files[0].text()
    const csvRows = fileText.split('\n')
    console.log(csvRows)
    // remove header
    csvRows.shift()
    console.log(csvRows)
    const seperatedRows = csvRows.map(row => row.slice(1, -1).split('";"'))
    console.log(seperatedRows)

    const tbody = parser.parseFromString(tbodyTemplate, 'text/html')
    const trTemplate = tbody.createElement('tr')
    trTemplate.innerHTML = '<td class="num-data private" headers="date"></td><td class="private" headers="film"></td><td class="centered-col" headers="language"></td><td class="centered-col" headers="rewatch"></td>'
    tbody.innerHTML = trTemplate.toString()

    console.log(tbody.innerHTML)

    document.getElementById('link-to-generated-html').setAttribute('href',
        `data:text/html,${tbody.textContent}`
    )

    // example
    '"2024-01-02";"Test;film";"";"x"'.slice(1, -1).split('";"')
}