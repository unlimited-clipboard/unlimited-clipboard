// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Tray, Menu, clipboard, dialog, globalShortcut} = require('electron')
const path = require('path')

if (!app.requestSingleInstanceLock()) {
    app.quit()
}

function start() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        frame: false,
        resizable: false,
        //movable: false,
        minimizable: false,
        maximizable: false,
        //closable: true,
        show: false,
        title: 'clips',
        //icon: path.join(__dirname, 'icons/16x16.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    })

    mainWindow.setMenuBarVisibility(false)

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    //mainWindow.webContents.openDevTools()

    const icon = {
        linux: 'icons/64x64.png',
        win32: 'icons/icons.ico',
        darwin: 'icons/16x16.png'
    }

    mainWindow.on('minimize', (event) => {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.on('close', (event) => {
        //mainWindow.reload();
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }

        return false;
    });

    const tray = new Tray(path.join(__dirname, icon[process.platform]))
    tray.setToolTip('Click to show your clipboard history')

    const template = [
        {
            label: 'Show history',
            click: () => mainWindow.show()
        },
        /*{
            label: 'Switch keyboard',
            click: switchKeyboard
        },*/
        {
            type: 'separator'
        },
        {
            label: 'Exit',
            click: () => app.exit()
        }
    ]

    let contextMenu = Menu.buildFromTemplate(template)
    tray.setContextMenu(contextMenu)

    globalShortcut.register('CmdOrCtrl+Alt+Up', () => {
        tray.focus()
        mainWindow.show();
    })

    //globalShortcut.register('CmdOrCtrl+Alt+Left', () => switchKeyboard)

    //setTimeout(() => mainWindow.send('asynchronous-message', clipboard.readText()), 1000)
}

function switchKeyboard() {
    let selection = clipboard.readText('selection');
    console.log(selection);

    clipboard.writeText('111', 'selection');

    selection = clipboard.readText('selection');
    console.log(selection);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(start)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) start()
})

/*ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg) // prints "ping"
    setTimeout(() => event.reply('asynchronous-message', clipboard.readText()), 1000)
})*/
