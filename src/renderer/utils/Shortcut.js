import Config from '../utils/Config'
const electron = require('electron')
const dialog = (electron.dialog || electron.remote.dialog)
const globalShortcut = (electron.globalShortcut || electron.remote.globalShortcut)
const settingWindow = (electron.remote && electron.remote.getCurrentWindow())

let shortcut = {}

shortcut.registShortCut = function(windowObj, key) {
    Config.read((conf) => {
        if (!conf || !conf.hotkey) {
            return
        }
        let hotkeysControl = conf.hotkey[key].control
        let hotkeysKey = conf.hotkey[key].key
        let hotkey = ''
        hotkeysControl.forEach((o, index) => {
            if (o) {
                hotkey += o + '+'
            }
        })
        if (!hotkey) {
            return
        }
        hotkey += hotkeysKey
        console.log('注册快捷键：' + hotkey)
        // 注册全局快捷键
        globalShortcut.unregisterAll()
        const ret = globalShortcut.register(hotkey, () => {
            if (windowObj.isVisible()) {
                windowObj.hide()
            } else {
                windowObj.show()
            }
        })

        if (!ret) {
            dialog.showMessageBox(settingWindow, {
                type: 'error',
                title: '错误',
                message: '快捷键可能已被占用'
            })
        }

        // 检查快捷键是否注册成功
        if (globalShortcut.isRegistered(hotkey)) {
            console.log('Shortcut registration sucess!')
        }
    })
}

export default shortcut
