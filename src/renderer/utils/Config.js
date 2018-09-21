import electron from 'electron'
import Datastore from 'nedb'
const path = require('path')

const config = {}

/**
 * 保证只有一个$db实例
 */
config.initNedb = function() {
    config.$db = electron.remote ? electron.remote.getGlobal('$db') : global.$db
    // electron render进程引用或主进程已有db对象
    if (config.$db) {
        return
    }
    // electron主进程中初始化
    const userDataPath = electron.app.getPath('home')
    const DB_DIR = path.join(userDataPath, 'clipnote')
    const DB_PATH = path.join(DB_DIR, 'clipnote.nedb')
    global.$db = new Datastore({
        autoload: true,
        filename: DB_PATH
    })
    config.$db = global.$db
}

config.default = {
    type: 'config',
    startup: false,
    clipboardCollection: true,
    hotkey: {
        toggleMain: {
            control: ['CmdOrCtrl'],
            key: '`'
        },
        toggleQuickrun: {
            control: ['CmdOrCtrl', 'Shift'],
            key: '`'
        }
    }
}

config.read = function () {
    return new Promise((resolve, reject) => {
        config.$db.findOne({
            type: 'config'
        }, (err, doc) => {
            if (err) {
                reject(err)
            } else {
                resolve(doc ? JSON.parse(JSON.stringify(doc)) : {})
            }
        })
    })
}

config.save = function (conf) {
    return new Promise((resolve, reject) => {
        config.read().then((obj) => {
            if (JSON.stringify(obj) !== '{}') {
                if (!conf || JSON.stringify(obj) === '{}') {
                    resolve(obj)
                    return
                }
                // 更新
                console.log('更新', obj, conf, JSON.stringify(obj))
                config.$db.update(obj, conf, {}, (err, numReplaced) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(conf)
                    }
                })
            } else {
                // 初始化
                config.$db.insert(config.default, (err, newDoc) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(newDoc)
                    }
                })
            }
        }).catch(err => {
            reject(err)
        })
    })
}

config.initNedb()
export default config
