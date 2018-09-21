const URL = {
    index: process.env.NODE_ENV === 'development'
        ? `http://localhost:9080`
        : `file://${__dirname}/index.html`
}

const NAME = {
    MAIN: 'main_window',
    EDIT: 'edit',
    SETTING: 'setting',
    QUICKRUN: 'quickrun',
    QUICKRUN_EDIT: 'quickrun_edit'
}

export default {
    URL,
    NAME
}
