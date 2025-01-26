const rowHtmlTemplate = `
    <td class="num-data" headers="date"></td>
    <td headers="film"></td>
    <td class="centered-col" headers="language"></td>
    <td class="centered-col" headers="rewatch"></td>
`

// primitive caching
let header = []
let decryptedRows = []
let localData = []

async function getSeparatedRowsFromLocalData() {
    if (localData.length == 0) {
        const file = await fetch('data.csv')
        const text = await file.text()
        localData = separateIntoRows(text)
    }
    return Array.from(localData)
}

function separateIntoRows(text, removeHeader = true) {
    const csvRows = text.split('\n')

    // remove double quotes around entries and split around semicolons
    const separatedRows = csvRows.map(row => row.slice(1, -1).split('";"'))

    if (removeHeader)
        header = separatedRows.shift()

    return separatedRows
}

/* 
 * Joins cells in each row with semicolons (with each entry in double quotes) and then
 * joins rows with line break.
 */
function joinRowsIntoString(rows) {
    return rows.map(row => row.map(value => `"${value}"`).join(';')).join('\n')
}

function encryptData(separatedRows, password) {
    const encryptedRows = []
    passwordCursor = 0

    for (const row of separatedRows) {
        const encryptedRow = []

        for (let colIndex = 0; colIndex < row.length; colIndex++) {
            const rawValue = row[colIndex]
            if (colIndex < 2) {
                const encryptedValue = vigenere(rawValue, password, passwordCursor)
                passwordCursor = (passwordCursor + rawValue.length) % password.length
                encryptedRow.push(encryptedValue)
            } else {
                encryptedRow.push(rawValue)
            }
        }
        encryptedRows.push(encryptedRow)
    }
    return encryptedRows
}

function decryptData(separatedRows, password) {
    if (decryptedRows.length == 0)
        decryptedRows = encryptData(separatedRows, getInversePassword(password))
    return Array.from(decryptedRows)
}

function createTBodies(rows, isEncrypted) {
    // can only be grouped by year if the data is not encrypted
    const separatedByYear = Object.groupBy(rows, row => isEncrypted ? '' : row[0].slice(0, 4))

    const tbodies = document.createDocumentFragment()

    // one tbody per year
    for (const [year, entries] of Object.entries(separatedByYear)) {
        const tbody = document.createElement('tbody')

        for (const row of entries) {
            // create row element with Template
            const trElement = document.createElement('tr')
            trElement.innerHTML = rowHtmlTemplate

            // set values in td elements
            for (let colIndex = 0; colIndex < row.length; colIndex++) {
                const textContent = document.createTextNode(row[colIndex])
                const currentCell = trElement.getElementsByTagName('td')[colIndex]
                currentCell.appendChild(textContent)
                if (isEncrypted && colIndex < 2)
                    currentCell.classList.add('private')
            }
            tbody.appendChild(trElement)
        }
        tbodies.appendChild(tbody)
    }

    return tbodies
}