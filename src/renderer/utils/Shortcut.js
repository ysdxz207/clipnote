import Config from '../utils/Config'
const electron = require('electron')
const globalShortcut = (electron.globalShortcut || electron.remote.globalShortcut)

let shortcut = {}

shortcut.registShortCut = function(windowObj, key, conf) {
    let error = {}
    return new Promise(function(resolve, reject) {
        Config.read((confOld) => {
            if (!conf || !conf.hotkey) {
                conf = confOld
            }
            let hotkeysControl = conf.hotkey[key].control
            let hotkeysControlOld = confOld.hotkey[key].control
            let hotkeysKey = confOld.hotkey[key].key
            let hotkeysKeyOld = conf.hotkey[key].key
            let hotkey = ''
            let hotkeyOld = ''
            hotkeysControl.forEach((o, index) => {
                if (o) {
                    hotkey += o + '+'
                }
            })
            hotkeysControlOld.forEach((o, index) => {
                if (o) {
                    hotkeyOld += o + '+'
                }
            })
            if (!hotkey) {
                reject(error)
            }
            hotkey += hotkeysKey
            hotkeyOld += hotkeysKeyOld
            console.log('注册快捷键：' + hotkey)
            // 注册全局快捷键
            if (hotkeyOld) {
                globalShortcut.unregister(hotkeyOld)
            }
            const ret = globalShortcut.register(hotkey, () => {
                if (windowObj.isVisible()) {
                    windowObj.hide()
                } else {
                    windowObj.show()
                }
            })

            if (!ret) {
                reject(error)
            }

            // 检查快捷键是否注册成功
            if (globalShortcut.isRegistered(hotkey)) {
                console.log('Shortcut registration sucess!')
                resolve()
            }
        })
    })
}

export default shortcut
