<template>
    <transition enter-active-class="bounceIn" leave-active-class="zoomOutTop">
        <el-form ref="note" :model="note">
            <el-form-item>
                <div v-if="note.id">
                {{formatDate(new Date(note.time), 'yyyy-MM-dd HH:mm:ss')}}
                </div>
                <el-input size="mini" v-model="note.title" autofocus placeholder="请输入笔记标题"></el-input>
                <img :src="note.context" v-if="note.type === 'pic'" @click="previewPic()" style="max-height:446px;max-width: 460px;vertical-align:middle;"/>
                <el-form-item v-if="note.type === 'pic'">
                    <el-button type="success" @click="copyNote(true)" plain size="mini">复制图片</el-button>
                </el-form-item>
                <el-input type="textarea"
                          v-if="note.type !== 'pic'"
                          v-model="note.context"
                          rows="11" placeholder="请输入笔记内容"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="default" @click="copyNote(false)" plain size="mini">复制base64</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="success" @click="editNote" size="mini">保存</el-button>
                <el-button @click="goToList" size="mini">取消</el-button>
            </el-form-item>
        </el-form>
    </transition>
</template>

<script>
    import electron from 'electron'
    import Clipboard from '../utils/Clipboard'
    import Constants from '../utils/Constants'
    let windowManager = electron.remote.require('electron-window-manager')

    export default {
        components: {},
        data() {
            return {
                note: {
                    id: this.$route.query.id,
                    categoryId: this.$route.query.categoryId
                },
                categories: [],
                previewWindow: null
            }
        },
        mounted() {
            let _this = this
            if (_this.note.id) {
                _this.loadNote()
            }
            // 所有分类
            _this.categories = _this.$db.get('categories').sortBy('time').cloneDeep().value().reverse().filter((o) => o.id !== _this.Constants.ID.defaultCategoryId)
        },
        methods: {
            loadNote() {
                let _this = this
                _this.note = _this.$db.get('notes').find({
                    id: _this.note.id
                }).cloneDeep().value()
            },
            editNote() {
                let _this = this
                if (!_this.note.title) {
                    _this.$message({
                        type: 'warning',
                        message: '请输入笔记标题'
                    })
                    return
                }
                if (_this.note.id) {
                    _this.$db.get('notes').find({
                        id: _this.note.id
                    }).assign(_this.note).write()
                } else {
                    _this.note.state = _this.Constants.STATE.available
                    _this.note.time = new Date().getTime()
                    _this.$db.read()
                    _this.note = _this.$db.get('notes').insert(_this.note).write()
                }
                // 添加到搜索引擎
                electron.ipcRenderer.send('lunr', _this.note)
                // 编辑成功跳转到对应分类
                _this.goToList()
            },
            goToList() {
                let _this = this
                let query = {
                    page: _this.$route.query.page
                }
                if (_this.$route.query.categoryId ||
                    (_this.note.state === _this.Constants.STATE.available)) {
                    query.categoryId = _this.$route.query.categoryId
                } else {
                    query.state = _this.note.state
                }
                _this.$router.push({name: 'list', query: query})
            },
            copyNote(isPic) {
                Clipboard.copyToClipboard(this.note.context, isPic).then(() => {
                    this.$message.success('已复制')
                })
            },
            previewPic() {
                let _this = this
                _this.previewWindow = windowManager.get(_this.Constants.NAME.PREVIEW).object
                if (!_this.previewWindow) {
                    _this.previewWindow = windowManager.createNew(_this.Constants.NAME.PREVIEW, '', Constants.URL.index + '#/preview', false, {
                        show: false,
                        frame: false,
                        parent: electron.remote.getCurrentWindow(),
                        modal: true,
                        resizable: false,
                        width: process.env.DEBUG === 'yes' ? 1000 : 520,
                        height: 320
                    }).create().object

                    if (process.env.DEBUG === 'yes') {
                        _this.previewWindow.webContents.openDevTools()
                    }

                    _this.previewWindow.on('close', (e) => {
                        e.preventDefault()
                        _this.previewWindow.hide()
                    })
                }

                _this.previewWindow.webContents.send('pic', _this.note.context)
                _this.previewWindow.show()
            }
        }
    }
</script>

<style>

</style>
