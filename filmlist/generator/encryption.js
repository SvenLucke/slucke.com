const rowHtmlTemplate = '<td class="num-data private" headers="date"></td><td class="private" headers="film"></td><td class="centered-col" headers="language"></td><td class="centered-col" headers="rewatch"></td>'

/* confirm password with 'Enter' */
document.getElementById('encryption-password').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault()
        document.getElementById('encrypt-button').click()
    }
})

document.getElementById('encrypt-button').onclick = async function convertCsvToHtml() {
    if (document.getElementById('filmlist-csv').files.length == 0)
        return

    const password = document.getElementById('encryption-password').value
    if (password == '')
        return

    const separatedRows = await getTableData()

    const tbodies = createTBodyElementsAsString(separatedRows, password)

    document.getElementById('preview-table').innerHTML = tbodies

    createDownloadButton(tbodies)
}

function createTBodyElementsAsString(separatedRows, password) {
    const separatedByYear = Object.groupBy(separatedRows, row => row[0].slice(0, 4))

    let tbodies = []
    let passwordCursor = 0

    // one tbody per year
    for (const [year, entries] of Object.entries(separatedByYear)) {
        const tbody = document.createElement('tbody')

        for (const row of entries) {
            // create row element with Template
            const trElement = document.createElement('tr')
            trElement.innerHTML = rowHtmlTemplate

            // set values in td elements (after encryption if necessary)
            for (let colIndex = 0; colIndex < row.length; colIndex++) {
                const rawData = row[colIndex]
                const currentCell = trElement.getElementsByTagName('td')[colIndex]
                if (currentCell.classList.contains('private')) {
                    const encryptedData = reverseVigenere(rawData, password, passwordCursor)
                    currentCell.innerText = encryptedData
                    passwordCursor = (passwordCursor + rawData.length) % password.length
                } else {
                    currentCell.innerText = rawData
                }
            }
            tbody.innerHTML += trElement.outerHTML
        }
        tbodies.push(tbody)
    }

    const tbodiesString = tbodies.map(tbody => tbody.outerHTML).join('')
    return tbodiesString
}

async function getTableData() {
    const fileText = await document.getElementById('filmlist-csv').files[0].text()
    const csvRows = fileText.split('\n')
    // remove header
    csvRows.shift()

    // remove double quotes around entries and split around semicolons
    const seperatedRows = csvRows.map(row => row.slice(1, -1).split('";"'))
    return seperatedRows
}

function createDownloadButton(tbodies) {
    const linkElement = document.createElement('a')
    linkElement.setAttribute('id', 'link-to-generated-file')
    linkElement.setAttribute('download', 'tbodies.html')
    linkElement.setAttribute('href', `data:text/plain,${encodeURIComponent(tbodies)}`)

    const button = document.createElement('button')
    button.innerText = 'Download tbodies.html'
    linkElement.appendChild(button)

    document.getElementsByTagName('hr')[0].insertAdjacentElement('afterend', linkElement)
}
