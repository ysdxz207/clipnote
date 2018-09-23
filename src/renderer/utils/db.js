import Datastore from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import path from 'path'
import electron from 'electron'
import Constants from './Constants'

const userDataPath = (electron.app || electron.remote.app).getPath('home')
const DB_DIR = path.join(userDataPath, 'clipnote')
const DB_PATH = path.join(DB_DIR, 'clipnote.json')
const adapter = new FileSync(DB_PATH)
const db = Datastore(adapter)
const lodashId = require('lodash-id')

db._.mixin(lodashId)

db.defaults({
    notes: [],
    categories: [
        {
            id: Constants.ID.defaultCategoryId,
            time: 999999999999999,
            name: '全部笔记'
        }
    ],
    shortcuts: [],
    config: {
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
}).write()

export default db
