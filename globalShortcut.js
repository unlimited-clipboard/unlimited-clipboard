const {clipboard, remote, globalShortcut, ipcRenderer} = require('electron');
const jquery = require('jquery');

const settings = require('electron-settings')

const input = document.querySelector('input');
const reset = document.querySelector("button[type='reset']");
const submit = document.querySelector("button[type='submit']");

remote.getCurrentWindow().on('show', async function() {
    input.focus()

    input.value = await settings.get('globalShortcut')
});

let keys = []
document.body.addEventListener('keyup', function(e) {
    //focusable.push(input);

    if (e.key === 'Enter') {

    } else if (e.key === 'Escape') {
        input.value = ''
        remote.getCurrentWindow().close();
    } else {
        input.focus();
        //input.value = ''

        if (keys.indexOf(e.key) === -1) {
            keys.push(e.key)
        }

        input.value = keys.join('+').replace("Control", "CmdOrCtrl").replace("Arrow","")

        return true
    }
});

reset.addEventListener('click', () => {
    input.value = ''
    keys = []
    input.focus()
});

submit.addEventListener('click', async () => {
    //input.value = ''
    //console.log(input.value)
    await settings.set('globalShortcut', input.value)

    input.focus()
    remote.getCurrentWindow().close()
    ipcRenderer.send('app-exit')
});
