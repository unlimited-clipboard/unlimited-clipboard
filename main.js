// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Tray, Menu, clipboard, dialog, globalShortcut} = require('electron')
const path = require('path')

if (!app.requestSingleInstanceLock()) {
    app.quit()
}

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 450,
        height: 600,
        //resizable: false,
        //movable: false,
        //minimizable: false,
        //maximizable: false,
        //closable: true,
        show: true,
        title: 'qwe',
        //icon: path.join(__dirname, 'icons/16x16.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    //mainWindow.webContents.openDevTools()

    const icon = {
        linux: 'icons/64x64.png',
        win32: 'icons/icons.ico',
        darwin: 'icons/16x16.png'
    }

    mainWindow.on('minimize', function (event) {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.on('close', function (event) {
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
            label: 'Show history', click: function () {
                mainWindow.show();
            }
        },
        /*{
            label: 'Quit', click: function () {
                app.isQuiting = true;
                app.quit();
            }
        }*/
    ]

    /*template.push({
      label: 'Clear clipboard history',
      click: dialogClearHistory
    })*/

    template.push({
        type: 'separator'
    })

    /*template.push({
        label: 'About',
        click: () => {
            win.show()
        }
    })*/

    /*template.push({
        label: 'emty buffer',
        click: () => {
            clipboard.writeText('')
        },
        type: 'radio',
        checked: true
    })*/

    template.push({
        label: 'Exit',
        click: () => {
            app.exit()
        }
    })

    let contextMenu = Menu.buildFromTemplate(template)
    tray.setContextMenu(contextMenu)

    globalShortcut.register('CmdOrCtrl+Shift+Y', () => {
        tray.focus()
        mainWindow.show();
    })

    //setTimeout(() => mainWindow.send('asynchronous-message', clipboard.readText()), 1000)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

/*ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg) // prints "ping"
    setTimeout(() => event.reply('asynchronous-message', clipboard.readText()), 1000)
})*/

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
