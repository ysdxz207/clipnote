import db from '../db'
// import { Message } from 'element-ui'

const config = {}

config.default = {
    type: 'config',
    startup: true,
    clipboardCollection: true
}

config.read = function (callback) {
    db.findOne({
        type: 'config'
    }, (err, doc) => {
        if (err) {
            // Message({
            //     type: 'error',
            //     message: '读取配置信息失败：' + err
            // })
            console.error(err)
        } else {
            if (callback) {
                callback(doc || config.default)
            }
        }
    })
}

config.save = function (conf, callback) {
    config.read((obj) => {
        if (JSON.stringify(obj) !== '{}') {
            if (!conf || JSON.stringify(obj) === '{}') {
                return
            }
            // 更新
            db.update(obj, conf, {}, (err, numReplaced) => {
                if (err) {
                    // Message({
                    //     type: 'error',
                    //     message: '更新配置失败：' + err
                    // })
                    console.error(err)
                } else {
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
