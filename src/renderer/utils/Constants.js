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

const ID = {
    defaultCategoryId: 'default_category_id',
    favouriteId: 'favourite_id',
    clipboardId: 'clipboard_id',
    recycleId: 'recycle_id'
}
export default {
    URL,
    NAME,
    ID
}
