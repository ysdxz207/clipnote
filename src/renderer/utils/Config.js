import db from '../db'
// import { Message } from 'element-ui'

const config = {}

config.default = {
    type: 'config',
    startup: false,
    clipboardCollection: true,
    hotkey: {
        toggleMain: {
            control: ['CmdOrCtrl'],
            key: '`'
        }
    }
}

config.read = function (callback) {
    db.findOne({
        type: 'config'
    }, (err, doc) => {
        console.log('read', doc)
        if (err) {
            // Message({
            //     type: 'error',
            //     message: '读取配置信息失败：' + err
            // })
            console.error(err)
        }
        if (callback) {
            callback(doc || {})
        }
    })
}

config.save = function (conf, callback) {
    config.read((obj) => {
        if (JSON.stringify(obj) !== '{}') {
            if (!conf || JSON.stringify(obj) === '{}') {
                if (callback) {
                    callback()
                }
                return
            }
            // 更新
            console.log('更新', obj, conf, JSON.stringify(obj))
            db.update(obj, conf, {}, (err, numReplaced) => {
                if (err) {
                    // Message({
                    //     type: 'error',
                    //     message: '更新配置失败：' + err
                    // })
                    console.error(err)
                } else {
                    console.log('num', numReplaced)
                    if (callback) {
                        callback()
                    }
                }
            })
        } else {
            // 初始化
            db.insert(config.default, (err, newDoc) => {
                if (err) {
                    // Message({
                    //     type: 'error',
                    //     message: '初始化配置失败：' + err
                    // })
                    console.error(err)
                } else {
                    if (callback) {
                        callback()
                    }
                }
            })
        }
    })
}

export default config
