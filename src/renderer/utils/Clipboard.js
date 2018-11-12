import $db from './db'
import Constants from './Constants'
import electron from 'electron'
const clipboard = require('electron-clipboard-extended')

const clip = {}
let copyAction = false

clip.watchOrUnWatch = function (callback) {
    let config = $db.get('config').cloneDeep().value()
    clipboard.off('text-changed')
    clipboard.off('image-changed')
    clipboard.stopWatching()
    if (!config.clipboardCollection) {
        return
    }
    clipboard
        .on('text-changed', () => {
            if (copyAction) {
                copyAction = false
                return
            }
            let currentText = clipboard.readText()
            if (currentText.replace(/\s+/g, '').replace(/[\r\n]/g, '').length === 0) {
                return
            }
            // 先读取一次，以防和Quickrun不一致
            $db.read()
            $db.get('notes').insert({
                state: Constants.STATE.clipboard,
                context: currentText,
                title: currentText.substring(0, 20),
                time: new Date().getTime()
            }).write()
            // console.log($db.getState())
            // 刷新列表
            electron.remote.getCurrentWindow().webContents.send('refreshList')
        })
        .on('image-changed', () => {
            let currentIMage = clipboard.readImage()
            console.log(currentIMage)
        })
        .startWatching()
}

clip.copyToClipboard = function (text) {
    return new Promise((resolve, reject) => {
        copyAction = true
        try {
            clipboard.writeText(text)
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

export default clip
