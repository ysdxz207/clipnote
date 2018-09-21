// import electron from 'electron'
import Config from './Config'
const db = Config.$db

const clipboard = require('electron-clipboard-extended')

const clip = {}
let copyAction = false

clip.watchOrUnWatch = function (callback) {
    Config.read().then((config) => {
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
                db.insert({
                    categoryId: 'clipboard',
                    type: 'note',
                    context: currentText,
                    title: currentText.substring(0, 20),
                    time: new Date().getTime()
                }, (err, newDoc) => {
                    if (err) {
                        console.error('收集剪贴板失败')
                    }
                })
            })
            .on('image-changed', () => {
                let currentIMage = clipboard.readImage()
                console.log(currentIMage)
            })
            .startWatching()
    }).catch(err => {
        console.error(err)
    })
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
