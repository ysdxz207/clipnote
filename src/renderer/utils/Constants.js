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
    QUICKRUN_EDIT: 'quickrun_edit',
    JSON_FORMATTER: 'json_formatter'
}

const ID = {
    defaultCategoryId: 'default_category_id'
}

const STATE = {
    available: 'available',
    favourite: 'favourite',
    clipboard: 'clipboard',
    recycle: 'recycle'
}
export default {
    URL,
    NAME,
    ID,
    STATE
}
