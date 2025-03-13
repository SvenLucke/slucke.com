const rowHtmlTemplate = `
    <td class="num-data" headers="date"></td>
    <td headers="film"></td>
    <td class="centered-col" headers="language"></td>
    <td class="centered-col" headers="rewatch"></td>
`
const privateColumns = [0, 1]

// primitive caching
let header = []
let decryptedRows = {}
let localData = {}

async function getSeparatedRowsFromLocalData(from, to = new Date().getFullYear()) {
    const result = {}
    for (let year = from; year <= to; year++) {
        if (!Object.hasOwn(localData, year)) {
            const file = await fetch(`data/${year}.csv`)
            if (file.status == 404) continue

            const text = await file.text()
            localData[year] = separateIntoRows(text)
        }
        result[year] = structuredClone(localData[year])
    }
    return result
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

function encryptData(rows, password) {
    const encryptedRows = []
    passwordCursor = 0

    for (const row of rows) {
        const encryptedRow = []

        for (let colIndex = 0; colIndex < row.length; colIndex++) {
            const rawValue = row[colIndex]
            if (privateColumns.includes(colIndex)) {
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

function decryptData(dataByYear, password) {
    for (const year in dataByYear) {
        if (!Object.hasOwn(decryptedRows, year))
            decryptedRows[year] = encryptData(dataByYear[year], getInversePassword(password))
    }
    return structuredClone(decryptedRows)
}

function createTBodies(dataByYear, isEncrypted) {
    const tbodies = document.createDocumentFragment()

    // one tbody per year
    for (const year in dataByYear) {
        const tbody = document.createElement('tbody')

        for (const row of dataByYear[year]) {
            // create row element with Template
            const trElement = document.createElement('tr')
            trElement.innerHTML = rowHtmlTemplate

            // set values in td elements
            for (let colIndex = 0; colIndex < row.length; colIndex++) {
                const textContent = document.createTextNode(row[colIndex])
                const currentCell = trElement.getElementsByTagName('td')[colIndex]
                currentCell.appendChild(textContent)
                if (isEncrypted && privateColumns.includes(colIndex))
                    currentCell.classList.add('private')
            }
            tbody.appendChild(trElement)
        }
        tbodies.appendChild(tbody)
    }

    return tbodies
}