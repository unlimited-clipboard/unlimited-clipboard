// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Tray, Menu, clipboard, dialog, globalShortcut} = require('electron')
const path = require('path')
const settings = require('electron-settings')

if (!app.requestSingleInstanceLock()) {
    app.quit()
}

async function start() {
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

    const globalShortcutWindow = new BrowserWindow({
        width: 400/* + 1000*/,
        height: 100/* + 500*/,
        frame: false,
        resizable: false,
        //movable: false,
        minimizable: false,
        maximizable: false,
        //closable: true,
        show: false,
        title: 'globalShortcut',
        //icon: path.join(__dirname, 'icons/16x16.png'),
        webPreferences: {
            //preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    })

    globalShortcutWindow.setMenuBarVisibility(false)

    // and load the index.html of the app.
    globalShortcutWindow.loadFile('globalShortcut.html')

    // Open the DevTools.
    //globalShortcutWindow.webContents.openDevTools()

    globalShortcutWindow.on('close', (event) => {
        //mainWindow.reload();
        if (!app.isQuiting) {
            event.preventDefault();
            globalShortcutWindow.hide();
        }

        return false;
    });

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
        {
            label: 'Change global Shortcut',
            click: () => globalShortcutWindow.show()
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

    let globalShortcutSettings = await settings.get('globalShortcut')
    if (!globalShortcutSettings) {
        await settings.set('globalShortcut', 'CmdOrCtrl+Alt+Up')
        globalShortcutSettings = 'CmdOrCtrl+Alt+Up'
    }

    globalShortcut.register(globalShortcutSettings, () => {
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

ipcMain.on('app-exit', () => {
    app.exit()
})
