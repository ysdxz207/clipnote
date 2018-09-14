'use strict'

import Config from '../renderer/utils/Config'

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Tray = electron.Tray
const globalShortcut = electron.globalShortcut
const AutoLaunch = require('auto-launch')
const path = require('path')
const Menu = electron.Menu

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
        height: 563,
        useContentSize: true,
        width: 1000,
        resizable: false
    })

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    registShortCut()
    registTray()
}

function registShortCut() {
    // 注册一个 'CommandOrControl+`' 的全局快捷键
    const ret = globalShortcut.register('CommandOrControl+`', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide()
        } else {
            mainWindow.show()
        }
    })

    if (!ret) {
        console.log('Shortcut registration failed!')
    }

    // 检查快捷键是否注册成功
    if (globalShortcut.isRegistered('CommandOrControl+`')) {
        console.log('Shortcut registration sucess!')
    }
}

function registTray() {
    // 读取配置
    Config.read((conf) => {
        tray = new Tray(ICON_PATH)
        const contextMenu = Menu.buildFromTemplate([
            {
                label: '关于',
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
        tray.setToolTip('equickrun')
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
    console.log()
}

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
