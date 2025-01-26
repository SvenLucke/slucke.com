/* confirm password with 'Enter' */
document.getElementById('encryption-password').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault()
        document.getElementById('encrypt-button').click()
    }
})

document.getElementById('encrypt-button').onclick = async function encryptCsv() {
    if (document.getElementById('filmlist-csv').files.length == 0)
        return

    const password = document.getElementById('encryption-password').value
    if (password == '')
        return

    const separatedRows = await getInputTableData()

    const encryptedRows = encryptData(separatedRows, password)

    const tbodies = createTBodies(encryptedRows, true)
    document.getElementById('preview-table').appendChild(tbodies)

    createDownloadButton(encryptedRows)
}

async function getInputTableData() {
    const fileText = await document.getElementById('filmlist-csv').files[0].text()
    return separateIntoRows(fileText)
}

async function createDownloadButton(rows) {
    // add cached header
    rows.unshift(header)

    const completeCsv = joinRowsIntoString(rows)

    const linkElement = document.createElement('a')
    linkElement.setAttribute('id', 'link-to-generated-file')
    linkElement.setAttribute('download', 'data.csv')
    linkElement.setAttribute('href', `data:text/csv,${encodeURIComponent(completeCsv)}`)

    const button = document.createElement('button')
    button.appendChild(document.createTextNode('Download data.csv'))
    linkElement.appendChild(button)

    document.getElementsByTagName('hr')[0].insertAdjacentElement('afterend', linkElement)
}
