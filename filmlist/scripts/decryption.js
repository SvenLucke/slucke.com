const expectedHash = 908276809
const salt = 'bÖsno/H*'

/* insert tbodies file into table on page */
window.onload = async function getTBodies() {
    const separatedRows = await getSeparatedRowsFromLocalData()
    const tbodies = createTBodies(separatedRows, true)

    document.getElementById('filmlist-table').appendChild(tbodies)

}

/* confirm password with 'Enter' */
document.getElementById('password').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault()
        document.getElementById('decrypt-button').click()
    }
})

/* implement decryption logic */
document.getElementById('decrypt-button').onclick = async function () {
    const password = document.getElementById('password').value

    if (password == '')
        return
    const hashedPass = getHash(password, salt)
    if (hashedPass != expectedHash) {
        // reset password
        document.getElementById('password').value = ''
        if (!document.getElementById('password-warning')) {
            insertPasswordWarning()
        }
        return
    }

    // display welcome message
    document.getElementsByTagName('header')[0].innerHTML = '<span style="color:green">Welcome!</span>'

    const decryptedRows = await decryptTable(password)
    addCsvDownloadButton(decryptedRows)
}

function insertPasswordWarning() {
    let element = document.createElement('span')
    element.setAttribute('id', 'password-warning')
    element.setAttribute('style', 'color:red')
    element.innerText = 'Wrong password!'
    document.getElementsByTagName('header')[0].appendChild(element)
}

async function decryptTable(password) {
    const separatedRows = await getSeparatedRowsFromLocalData()
    const decryptedRows = decryptData(separatedRows, password)
    const tbodies = createTBodies(decryptedRows, false)
    // remove old tbodies and append new ones
    Array.from(document.getElementsByTagName('tbody')).forEach(element => element.remove())
    document.getElementById('filmlist-table').appendChild(tbodies)
    return decryptedRows
}

function addCsvDownloadButton(decryptedRows) {
    // add cached header
    decryptedRows.unshift(header)

    const tableContent = joinRowsIntoString(decryptedRows)

    let linkElement = document.createElement('a')
    linkElement.setAttribute('href', `data:text/csv,${encodeURIComponent(tableContent)}`)

    //set filename to include current date
    linkElement.setAttribute('download', `filmList-${new Date().toISOString().slice(0, 10)}.csv`)

    let button = document.createElement('button')
    button.appendChild(document.createTextNode('Download as CSV'))
    linkElement.appendChild(button)

    document.getElementsByTagName('header')[0].appendChild(linkElement)
}
