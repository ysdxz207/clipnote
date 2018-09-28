import $db from './db'
const electron = require('electron')
const globalShortcut = (electron.globalShortcut || electron.remote.globalShortcut)
let shortcut = {}

shortcut.registShortCut = function(windowObj, key, value) {
    let confOld = $db.get('config').cloneDeep().value()
    if (!value) {
        value = confOld.hotkey[key]
    }
    let hotkeysControl = value.control
    let hotkeysControlOld = confOld.hotkey[key].control
    let hotkeysKey = value.key
    let hotkeysKeyOld = confOld.hotkey[key].key
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
        return false
    }
    hotkey += hotkeysKey
    hotkeyOld += hotkeysKeyOld
    console.log('注册快捷键：' + hotkey)
    // 注册全局快捷键
    if (hotkeyOld) {
        console.log('============un register', hotkeyOld)
        globalShortcut.unregister(hotkeyOld)
    }
    const ret = globalShortcut.register(hotkey, () => {
        if (windowObj.isVisible()) {
            windowObj.hide()
            windowObj.getChildWindows().forEach((win) => {
                win.hide()
            })
        } else {
            windowObj.show()
        }
    })

    if (!ret) {
        return false
    }

    // 检查快捷键是否注册成功
    if (globalShortcut.isRegistered(hotkey)) {
        console.log('Shortcut registration sucess!')
        $db.read()
        $db.set('config.hotkey.' + key, value).write()
        return true
    }
}

export default shortcut
