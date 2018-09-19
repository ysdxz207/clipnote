'use strict'

import Config from '../renderer/utils/Config'
import Shortcut from '../renderer/utils/Shortcut'

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Tray = electron.Tray
const AutoLaunch = require('auto-launch')
const path = require('path')
const Menu = electron.Menu
const ipcMain = electron.ipcMain

const ICON_PATH = path.join(__static, 'assets/icons/app/icon.ico')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, tray
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

const settingURL = winURL + '/#/setting'

// 开机启动
var clipnoteAutoLauncher = new AutoLaunch({
    name: app.getName(),
    path: process.cwd() + path.sep + app.getName() + '.exe'
})

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 563,
        frame: false,
        useContentSize: true,
        resizable: false,
        show: false,
        transparent: true
    })

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', (e) => {
        mainWindow = null
    })
<<<<<<< HEAD
    mainWindow.openDevTools()

=======
    // 初始化配置
    Config.save(undefined, () => {
        // 注册快捷键
        Shortcut.registShortCut(mainWindow, 'toggleMain')
    })
>>>>>>> 80f8709e824513ed90948bb24e3d1ef23bd72dc5
    registTray()
}

function registTray() {
    // 读取配置
    Config.read((conf) => {
        tray = new Tray(ICON_PATH)
        const contextMenu = Menu.buildFromTemplate([
            {
                label: '源码',
                type: 'normal',
                click() {
                    require('electron').shell.openExternal('https://github.com/ysdxz207/clipnote.git')
                }
            },
            {
                label: '设置',
                type: 'normal',
                click() {
                    settings()
                }
            },
            {
                label: '开机启动',
                type: 'checkbox',
                checked: conf['startup'],
                click(menuItem) {
                    conf['startup'] = menuItem.checked
                    Config.save(conf, function () {
                        // 处理开机启动项
                        toggleStartUp(menuItem.checked)
                    })
                }
            },
            {
                label: '退出',
                type: 'normal',
                click() {
                    app.quit()
                }
            }
        ])
        tray.setToolTip('点击显示/隐藏主窗体')
        tray.setContextMenu(contextMenu)

        tray.on('click', function (e) {
            // 单击显示主窗体
            if (mainWindow.isVisible()) {
                mainWindow.hide()
            } else {
                mainWindow.show()
            }
        })
    })
}

function toggleStartUp(startup) {
    if (startup) {
        clipnoteAutoLauncher.enable()
    } else {
        clipnoteAutoLauncher.disable()
    }
}

function settings() {
    let child = new BrowserWindow({
        width: 1000,
        height: 600,
        parent: mainWindow,
        modal: true,
        show: false,
        resizable: false,
        webPreferences: {
            webSecurity: false
        }
    })
    if (process.env.NODE_ENV === 'development') {
        child.loadURL(settingURL)
    } else {
        child.loadFile(settingURL)
    }
    child.once('ready-to-show', () => {
        child.show()
    })
    child.openDevTools()
}

ipcMain.on('hideWindow', () => {
    mainWindow.hide()
})

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
