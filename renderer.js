const {clipboard} = require('electron')

const dexie = require('dexie')
dexie.debug = true;
const db = new dexie("history");

const input = document.querySelector('input');
const table = document.querySelector('table');

document.body.addEventListener('keyup', refreshView);

table.addEventListener('click', async function (e) {
    if (e.target.id) {
        if (clipboard.readText() === (await db.history.get(parseInt(e.target.id))).text) {
            return;
        }

        if (e.target.tagName === 'TD') {
            clipboard.writeText((await db.history.get(parseInt(e.target.id))).text);
        } else if (e.target.id && e.target.tagName === 'BUTTON') {

        }

        await db.history.delete(parseInt(e.target.id));
        refreshView()
    }

    //db.history.keys((r) => {console.log(r)});

    //console.log(e.target.id)
    //console.log(e.target.tagName)
});

function refreshView() {
    return db.history.limit(10).desc()
        .filter(function (history) {
            return !input.value || history.text.indexOf(input.value) !== -1;
        })
        .toArray()
        .then(function renderHistory(history) {
            table.innerHTML = '';
            let tabindex = 0;
            history.forEach(function (row) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<tr><td id="${row.id}"=tabindex="${++tabindex}"> </td><td><button id="${row.id}">x</button></td></tr>`;
                //console.log(tr.querySelector('td'));
                tr.querySelector('td').innerText = row.text.replace(/\n/g, ' ');
                table.appendChild(tr);
            });
        });
}

/*db.history.add({text: "qweqwe"}).then(() => db.history.add({text: "qweqwe"})).then(() => db.history.toArray())
    .then(function (copied) {
        //alert ("My young friends: " + JSON.stringify(copied));
        console.log("My young friends: " + JSON.stringify(copied))
    }).catch(function (e) {
    //alert ("Error: " + (e.stack || e));
    console.log("Error: " + (e.stack || e))
});*/

const {ipcRenderer} = require('electron')
//console.log(ipcRenderer.send('asynchronous-message', 'ping')) // prints "pong"

/*ipcRenderer.on('asynchronous-message', (event, arg) => {
    console.log(arg) // prints "ping"
    setTimeout(() => ipcRenderer.send('asynchronous-message', 'ping'), 1000)
})

ipcRenderer.send('asynchronous-message', 'ping')*/

setTimeout(async () => {
    await db.version(1).stores({history: "++id,text"});

    db.history.count((r) => document.querySelector('title').innerText = `history (${r})`);

    refreshView();

    let previousText = clipboard.readText();

    /*try {
        previousText = (await db.history.last()).text;
    } catch (e) {
        previousText = '';
        //console.log(e);
    }
    console.log('previousText:' + previousText)*/

    setInterval(async () => {
        if (previousText !== clipboard.readText()) {
            previousText = clipboard.readText();
            //console.log('newText:' + previousText)
            db.history.add({text: previousText}).then(refreshView);
        }
    }, 100)
});
