const URL = {
    index: process.env.NODE_ENV === 'development'
        ? `http://localhost:9080`
        : `file://${__dirname}/index.html`
}

const TITLE = {
    MAIN: 'main_window',
    EDIT: 'edit',
    SETTING: 'setting',
    QUICKRUN: 'quickrun',
    QUICKRUN_EDIT: 'quickrun_edit'
}

let ID = {
    MAIN: 0,
    EDIT: 0,
    SETTING: 0,
    QUICKRUN: 0,
    QUICKRUN_EDIT: 0
}

export default {
    URL,
    ID,
    TITLE
}
