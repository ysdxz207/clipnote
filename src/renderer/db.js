import Datastore from 'nedb'
import path from 'path'
import {remote} from 'electron'

const userDataPath = remote.app.getPath('home')
const DB_DIR = path.join(userDataPath, 'clipnote')
const DB_PATH = path.join(DB_DIR, 'clipnote.nedb')

export default new Datastore({
    autoload: true,
    filename: DB_PATH
})
