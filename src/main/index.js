'use strict'

import Config from '../renderer/utils/Config'
import Shortcut from '../renderer/utils/Shortcut'
import Constants from '../renderer/utils/Constants'
const electron = require('electron')
const app = electron.app
const Tray = electron.Tray
const AutoLaunch = require('auto-launch')
const path = require('path')
const Menu = electron.Menu
const windowManager = require('electron-window-manager')

const ICON_PATH = path.join(__static, 'assets/icons/app/icon.ico')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, quickrunWindow, settingsWindow, tray
const winURL = Constants.URL.index

const settingURL = winURL + '#/setting'
const quickrunURL = winURL + '#/quickrun'

// 开机启动
let clipnoteAutoLauncher = new AutoLaunch({
    name: app.getName(),
    path: process.cwd() + path.sep + app.getName() + '.exe'
})

function init() {
    // 创建笔记窗口
    windowManager.init({})
    mainWindow = windowManager.createNew(Constants.NAME.MAIN, '', winURL, false, {
        width: process.env.DEBUG === 'yes' ? 1000 : 830,
        height: 562,
        frame: false,
        useContentSize: true,
        resizable: false,
        show: false,
        alwaysOnTop: true,
        transparent: true
    }).create().object

    console.log('window,', mainWindow)

    mainWindow.on('closed', (e) => {
        mainWindow = null
    })
    // 创建quickrun窗口
    quickrunWindow = windowManager.createNew(Constants.NAME.QUICKRUN, '', quickrunURL, false, {
        width: process.env.DEBUG === 'yes' ? 720 : 220,
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
    }).create().object
    quickrunWindow.on('closed', (e) => {
        quickrunWindow = null
    })
    if (process.env.DEBUG === 'yes') {
        quickrunWindow.openDevTools()
    }
    // 创建设置窗口
    settingsWindow = windowManager.createNew(Constants.NAME.SETTING, '', settingURL, false, {
        width: process.env.DEBUG === 'yes' ? 1000 : 600,
        height: 400,
        parent: mainWindow,
        frame: false,
        modal: true,
        show: false,
        resizable: false,
        webPreferences: {
            webSecurity: false
        }
    }).create().object
    if (process.env.DEBUG === 'yes') {
        settingsWindow.openDevTools()
    }
    // 初始化配置
    Config.save().then(() => {
        // 注册快捷键
        Shortcut.registShortCut(mainWindow, 'toggleMain')
        Shortcut.registShortCut(quickrunWindow, 'toggleQuickrun')
    }).catch(err => {
        console.error(err)
    })
    // 注册托盘
    registTray()
}

function registTray() {
    // 读取配置
    Config.read().then((conf) => {
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
                    if (!mainWindow.isVisible()) {
                        mainWindow.show()
                    }
                    settingsWindow.show()
                }
            },
            {
                label: '开机启动',
                type: 'checkbox',
                checked: conf['startup'],
                click(menuItem) {
                    conf['startup'] = menuItem.checked
                    Config.save(conf).then(function () {
                        // 处理开机启动项
                        toggleStartUp(menuItem.checked)
                    }).catch(err => {
                        console.error(err)
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
    }).catch(err => {
        console.error(err)
    })
}

function toggleStartUp(startup) {
    if (startup) {
        clipnoteAutoLauncher.enable()
    } else {
        clipnoteAutoLauncher.disable()
    }
}
// 单开程序
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
        if (!mainWindow.isVisible()) mainWindow.show()
        mainWindow.focus()
    }
})

if (shouldQuit) {
    app.quit()
}

app.on('ready', init)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        init()
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
