import db from '../db'
import Config from './Config'

const clipboard = require('electron-clipboard-extended')

const clip = {}

clip.watchOrUnWatch = function (callback) {
    console.log('start watch')
    Config.read((config) => {
        clipboard.off('text-changed')
        clipboard.off('image-changed')
        clipboard.stopWatching()
        if (!config.clipboardCollection) {
            return
        }
        clipboard
            .on('text-changed', () => {
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
    })
}

export default clip
