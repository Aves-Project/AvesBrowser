const { BrowserWindow, ipcMain, app } = require('electron')
const path = require('path')
const fs = require('fs')

class WindowManager {
  constructor() {
    this.windows = new Set()
    this.lastFocusedWindow = null
  }

  createWindow() {
    const newWindow = new BrowserWindow({
      width: 900,
      height: 700,
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 12, y: 10 },
      icon: path.join(__dirname, '../icons/icon256.png'),
      frame: process.platform !== 'win32',
      minWidth: 320,
      minHeight: 500,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      }
    })

    newWindow.loadURL('min://app/index.html')

    this.windows.add(newWindow)

    newWindow.on('focus', () => {
      this.lastFocusedWindow = newWindow
    })

    newWindow.on('closed', () => {
      this.windows.delete(newWindow)
      if (this.windows.size === 0) {
        this.lastFocusedWindow = null
      }
    })

    return newWindow
  }

  getAll() {
    return Array.from(this.windows)
  }

  getCurrent() {
    return this.lastFocusedWindow || (this.windows.size > 0 ? this.windows.values().next().value : null)
  }

  windowFromContents(webContents) {
    return this.getAll().find(window => window.webContents.id === webContents.id)
  }

  saveWindowBounds() {
    const currentWindow = this.getCurrent()
    if (currentWindow) {
      const bounds = Object.assign(currentWindow.getBounds(), {
        maximized: currentWindow.isMaximized()
      })
      fs.writeFileSync(path.join(app.getPath('userData'), 'windowBounds.json'), JSON.stringify(bounds))
    }
  }

  restoreWindowBounds(window) {
    try {
      const boundsString = fs.readFileSync(path.join(app.getPath('userData'), 'windowBounds.json'), 'utf8')
      const bounds = JSON.parse(boundsString)
      if (bounds.maximized) {
        window.maximize()
      } else {
        window.setBounds(bounds)
      }
    } catch (e) {
      // Error reading bounds file, use default window size
      console.error('Error restoring window bounds:', e)
    }
  }
}

const windowManager = new WindowManager()

ipcMain.on('create-window', () => {
  windowManager.createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (windowManager.getAll().length === 0) {
    windowManager.createWindow()
  }
})

module.exports = windowManager
