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
                type: 'note',
                time: new Date().getTime()
            }).write()
            // console.log($db.getState())
            // 刷新列表
            electron.remote.getCurrentWindow().webContents.send('refreshList')
        })
        .on('image-changed', () => {
            if (copyAction) {
                copyAction = false
                return
            }
            let currentIMage = clipboard.readImage()
            console.log(currentIMage.toPNG())
            let base64 = 'data:image/png;base64,' + currentIMage.toPNG().toString('base64')
            // 先读取一次，以防和Quickrun不一致
            $db.read()
            $db.get('notes').insert({
                state: Constants.STATE.clipboard,
                context: base64,
                title: '',
                type: 'pic',
                time: new Date().getTime()
            }).write()
            // 刷新列表
            electron.remote.getCurrentWindow().webContents.send('refreshList')
        })
        .startWatching()
}

clip.copyToClipboard = function (text, isPic = false) {
    return new Promise((resolve, reject) => {
        copyAction = true
        try {
            if (!isPic) {
                clipboard.writeText(text)
            } else {
                let img = electron.nativeImage.createFromDataURL(text)
                clipboard.writeImage(img)
            }
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

export default clip
