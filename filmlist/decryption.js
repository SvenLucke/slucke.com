const expectedHash = 654460158

/* insert tbodies file into table on page */
window.onload = async function getTBodies() {
    fetch('tbodies.html')
        .then(value => value.text())
        .then(value => document.getElementsByTagName('table')[0].innerHTML += value)
}

/* confirm password with 'Enter' */
document.getElementById('password').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault()
        document.getElementById('decrypt-button').click()
    }
})

/* implement decryption logic */
document.getElementById('decrypt-button').onclick = function () {
    const password = document.getElementById('password').value

    if (password == '')
        return
    const hashedPass = getHash(password)
    if (hashedPass != expectedHash) {
        // reset password
        document.getElementById('password').value = ''
        if (!document.getElementById('password-warning')) {
            insertPasswordWarning()
        }
        return
    }

    decryptTable(password)

    // display welcome message
    document.getElementsByTagName('header')[0].innerHTML = '<text style="color:green">Welcome!</text>'

    addCsvDownloadButton()
}

function insertPasswordWarning() {
    let element = document.createElement('text')
    element.setAttribute('id', 'password-warning')
    element.setAttribute('style', 'color:red')
    element.innerText = 'Wrong password!'
    document.getElementsByTagName('header')[0].appendChild(element)
}

function decryptTable(password) {
    let cells = Array.from(document.getElementsByClassName('private'))

    let passwordCursor = 0
    for (let index = 0; index < cells.length; index++) {
        const element = cells[index]
        const message = element.innerText
        element.innerText = vigenere(message, password, passwordCursor)
        passwordCursor = (passwordCursor + message.length) % password.length
        element.classList.remove('private')
    }
}

function addCsvDownloadButton() {
    const tableContent = getTableDataAsString()

    let linkElement = document.createElement('a')
    linkElement.setAttribute('href', `data:text/csv,${encodeURIComponent(tableContent)}`)

    //set filename to include current date
    linkElement.setAttribute('download', `filmList-${new Date().toISOString().slice(0, 10)}.csv`)

    let button = document.createElement('button')
    button.innerText = 'Download as CSV'
    linkElement.appendChild(button)

    document.getElementsByTagName('header')[0].appendChild(linkElement)
}

function getTableDataAsString() {
    const header = Array.from(document.getElementsByTagName('th'))
        .map(colHead => `"${colHead.innerText.toString().replaceAll('\n', '')}"`)
        .join(';')

    const rows = Array.from(document.getElementsByTagName('tr'))
    // remove header row
    rows.shift()

    // join cells in row with semicolons (each entry double quotes)
    // join rows with line break
    const csvData = rows.map(row => {
        const cells = Array.from(row.getElementsByTagName('td'))
        return cells.map(cell => `"${cell.innerText}"`).join(';')
    }).join('\n')

    const tableContent = header + '\n' + csvData
    return tableContent
}
