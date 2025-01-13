document.getElementById('filmlist-table').innerHTML += await getTBodies()

async function getTBodies() {
    return fetch('tbodies.html').then(value => value.text())
}