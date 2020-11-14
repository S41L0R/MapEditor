const { app, BrowserWindow } = require('electron')


const ipc = require('electron').ipcMain;


let win

ipc.on('toMainWindow', (event, message) => {
	console.log(event, message);
	win.webContents.send('fromActorEditor', message);
})

function createWindow () {
  // Create the browser window.
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



  win.on('closed', () => app.quit());





}

app.whenReady().then(createWindow)



