'use strict'

import Config from '../renderer/utils/Config'
import Shortcut from '../renderer/utils/Shortcut'
import Constants from '../renderer/utils/Constants'

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Tray = electron.Tray
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

let mainWindow, quickrunWindow, tray
const winURL = Constants.URL.index

const settingURL = winURL + '#/setting'
const quickrunURL = winURL + '#/quickrun'

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
        title: Constants.TITLE.MAIN,
        width: process.env.debug ? 1000 : 830,
        height: 562,
        frame: false,
        useContentSize: true,
        resizable: false,
        show: false,
        alwaysOnTop: true,
        transparent: true
    })

    Constants.ID.MAIN = mainWindow.id
    mainWindow.loadURL(winURL)

    mainWindow.on('closed', (e) => {
        mainWindow = null
    })
    // 创建quickrun窗口
    quickrunWindow = new BrowserWindow({
        width: process.env.debug ? 720 : 220,
        height: 560,
        frame: false,
        useContentSize: true,
        resizable: false,
        show: true,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            webSecurity: false
        }
    })
    Constants.ID.QUICKRUN = quickrunWindow.id
    quickrunWindow.loadURL(quickrunURL)
    quickrunWindow.on('closed', (e) => {
        quickrunWindow = null
    })
    if (process.env.debug) {
        quickrunWindow.openDevTools()
    }
    // 初始化配置
    Config.save(undefined, () => {
        // 注册快捷键
        Shortcut.registShortCut(mainWindow, 'toggleMain')
        Shortcut.registShortCut(quickrunWindow, 'toggleQuickrun')
    })
    // 注册托盘
    registTray()
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
                    if (!mainWindow.isVisible()) {
                        mainWindow.show()
                    }
                    electron.dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        message: '当前版本：' + require('../../package').version
                    })
                }
            },
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
    if (!mainWindow.isVisible()) {
        mainWindow.show()
    }
    let existsSetting = BrowserWindow.fromId(Constants.ID.SETTING)
    if (existsSetting) {
        existsSetting.show()
        return
    }
    let settingWindow = new BrowserWindow({
        title: Constants.TITLE.SETTING,
        width: process.env.debug ? 1000 : 600,
        height: 400,
        parent: mainWindow,
        frame: false,
        modal: true,
        show: false,
        resizable: false,
        webPreferences: {
            webSecurity: false
        }
    })
    Constants.ID.SETTING = settingWindow.id
    settingWindow.loadURL(settingURL)
    settingWindow.once('ready-to-show', () => {
        settingWindow.show()
    })
    if (process.env.debug) {
        settingWindow.openDevTools()
    }
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
