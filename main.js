// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Tray } = require('electron')
const path = require('path')
const electron = require("electron");
const fs = require('fs');
const url = require('url');
const mode = process.argv[2];
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
function createWindow() {

    let area = electron.screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: area.width,
        height: area.height,
        x: 0,
        y: 0,
        alwaysOnTop: true,
        resizable: false,
        frame: false,
        transparent: true,
        icon: path.join(__dirname, 'logo.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            plugins: true,
        }
    });

    // and load the index.html of the app.
    if (mode === 'dev') {
        mainWindow.loadURL("http://localhost:3000/")
    } else {
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, './build/index.html'),
            protocol: 'file:',
            slashes: true
        }))
    }
    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null
    })

}
//限制只允许创建一个实例
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
}
app.disableHardwareAcceleration()
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
// app.on('ready', createWindow)
// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
})

ipcMain.on('exitApp', () => {
    app.quit();
})