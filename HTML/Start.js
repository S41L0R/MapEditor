const { app, BrowserWindow, Menu } = require('electron');
const fs = require('fs');
const isMac = process.platform === 'darwin'

const ipc = require('electron').ipcMain;

const template = [
  //These menu names are beginning to physically hurt
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'Ffiel',
    submenu: [
      {label: 'Save',
        id: 'save',
        click: () => {
          //editor.save()
          console.warn('Saved!')
	win.webContents.send('Save');
        }
      },
      {type: 'separator'},
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Eddit',
    submenu: [
      {
        label: 'Un',
        role: 'undo'
      },
      {
        label: 'Re',
        role: 'redo'
      },
      { type: 'separator' },
      {
        label: 'Choppe',
        role: 'cut'
      },
      {
        label: 'Duplii',
        role: 'copy'
      },
      {
        label: 'Paist',
        role: 'paste'
      },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        {
          label: 'Byie',
          role: 'delete'
        },
        { type: 'separator' },
        {
          label:'Sdelect allel',
          role: 'selectAll'
        }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'Veiwf',
    submenu: [
      {
        label: 'Relaod',
        role: 'reload'
      },
      {
        label: 'Foorce Rleoad',
        role: 'forceReload'
      },
      {
        label: 'Togglges dve tols',
        role: 'toggleDevTools'
      },
      { type: 'separator' },
      {
        label: 'Togell Bieag',
        role: 'togglefullscreen'
      }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Widnow',
    submenu: [
      {
        label: 'Minsimize',
        role: 'minimize'
      },
      {
        label: 'Zoome',
        role: 'zoom'
      },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        {
          label: 'Clos',
          role: 'close'
        }
      ])
    ]
  },
  {
    label: 'hlalp',
    submenu: [
      {
        label: "I am so bad at this software and I need help. Please help me I don't know how to read docs because I am bad at stuff.",
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwiR9sq88YztAhWhF1kFHTumA6UQyCkwAnoECAcQAw&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ%26list%3DPLahKLy8pQdCM0SiXNn3EfGIXX19QGzUG3&usg=AOvVaw1ejI_XgrR-IkInfsCFoNfB')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

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
  win.on('closed', () => app.quit());

}


app.whenReady().then(createWindow)
