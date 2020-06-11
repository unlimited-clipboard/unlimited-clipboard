const {clipboard, remote} = require('electron');
const jquery = require('jquery');
const dexie = require('dexie')
dexie.debug = true;
const db = new dexie("history");

const input = document.querySelector('input');
const table = document.querySelector('table');

remote.getCurrentWindow().on('show', function(){
    input.focus();
});

document.body.addEventListener('keydown', function(e) {
    let focusable = Array.from(document.querySelectorAll("tr td:first-child"));

    let index = focusable.indexOf(document.activeElement);

    //focusable.push(input);

    if (e.key === 'ArrowDown') {
        let nextElement = focusable[index + 1] || focusable[0];
        nextElement.focus();
    } else if (e.key === 'ArrowUp') {
        let nextElement = focusable[index - 1] || focusable[focusable.length - 1];
        nextElement.focus();
    } else if (e.key === 'Enter') {
        changeToSelected(e)
    } else if (e.key === 'Escape') {
        input.value = '';
        refreshView();
        remote.getCurrentWindow().close();
    } else {
        input.focus();
        refreshView();
    }
});

table.addEventListener('click', changeToSelected);

async function changeToSelected(e) {
    if (e.target.id) {
        if (clipboard.readText() === (await db.history.get(parseInt(e.target.id))).text) {
            return;
        }

        if (e.target.tagName === 'TD') {
            clipboard.writeText((await db.history.get(parseInt(e.target.id))).text);
        } else if (e.target.id && e.target.tagName === 'BUTTON') {

        }

        await db.history.delete(parseInt(e.target.id));
        refreshView();
    }

    //db.history.keys((r) => {console.log(r)});

    //console.log(e.target.id)
    //console.log(e.target.tagName)
}

function refreshView() {
    db.history.count((r) => document.querySelector('title').innerText = `history (${r})`);
    return db.history.limit(10).desc()
        .filter((history) => {
            return !input.value || history.text.indexOf(input.value) !== -1;
        })
        .toArray()
        .then((history) => {
            table.innerHTML = '';
            let tabindex = 0;
            history.forEach((row) => {
                const tr = document.createElement('tr');
                tabindex++
                tr.innerHTML = `<tr><td tabindex="${tabindex}" id="${row.id}"> </td><td><button id="${row.id}">&#10006;</button></td></tr>`;
                //console.log(tr.querySelector('td'));
                tr.querySelector('td').innerText = row.text.replace(/\n/g, ' ');
                table.appendChild(tr);
            });
        });
}

const {ipcRenderer} = require('electron')
//console.log(ipcRenderer.send('asynchronous-message', 'ping')) // prints "pong"

/*ipcRenderer.on('asynchronous-message', (event, arg) => {
    console.log(arg) // prints "ping"
    setTimeout(() => ipcRenderer.send('asynchronous-message', 'ping'), 1000)
})

ipcRenderer.send('asynchronous-message', 'ping')*/

setTimeout(async () => {
    await db.version(1).stores({history: "++id,text"});

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
            db.history.limit(10000).desc()
                .filter((history) => {
                    return history.text === previousText;
                })
                .toArray()
                .then((history) => {
                    history.forEach((row) => {
                        console.log(row.id);
                        db.history.delete(row.id);
                    });
                });
            db.history.add({text: previousText}).then(refreshView);
        }
    }, 100)
});
