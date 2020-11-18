const { app, BrowserWindow, Menu } = require('electron')
const fs = require('fs')
const isMac = process.platform === 'darwin'

const ipc = require('electron').ipcMain;
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {role: 'Save'},
      {type: 'Separator'},
      {role: 'Exit'}
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {role: 'Undo'},
      {type: 'Separator'},
      {role: 'Redo'},
      {type: 'Separator'},
      {role: 'Copy JSON'},
      {type: 'Separator'},
      {role: 'Paste JSON'},
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'Reload'},
      {role: 'Force Reload'},
      {role: "Dev-tools"}
    ]
  }
];

let win

ipc.on('toMainWindow', (event, message) => {
	console.log(event, message);
	win.webContents.send('fromActorEditor', message);
})

function createWindow () {
  // Create the browser window and menu
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: '../Assets/UI/Logo/MapEditorIconDarkMode-Alt.png',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  // and load the index.html of the app.
  win.loadFile('../editor.html')
  var menu = createMenu()
  Menu.setApplicationMenu(menu)
  win.on('closed', () => app.quit());

}

function createMenu() {
  console.warn(mainMenuTemplate)
  const menu = Menu.buildFromTemplate(mainMenuTemplate)
  return menu
  }


app.whenReady().then(createWindow)



