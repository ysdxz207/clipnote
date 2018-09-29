import $db from './db'
const electron = require('electron')
const globalShortcut = (electron.globalShortcut || electron.remote.globalShortcut)
let shortcut = {}

shortcut.registShortCut = function(windowObj, key, value) {
    let confOld = $db.get('config').cloneDeep().value()
    if (!value) {
        value = confOld.hotkey[key]
    }
    let hotkey = value
    let hotkeyOld = confOld.hotkey[key]
    if (!hotkey) {
        return false
    }
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
        // 重新读取，以防覆盖其他值
        $db.read()
        // 部分修改，以防覆盖其他值
        $db.set('config.hotkey.' + key, value).write()
        return true
    }
}

export default shortcut
