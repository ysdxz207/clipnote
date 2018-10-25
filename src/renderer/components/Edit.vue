<template>
    <transition enter-active-class="bounceIn" leave-active-class="zoomOutTop">
        <el-form ref="note" :model="note">
            <el-form-item>
                {{formatDate(new Date(note.time))}}
                <el-input size="mini" v-model="note.title" autofocus placeholder="请输入笔记标题"></el-input>
                <el-input type="textarea"
                          v-model="note.context"
                          rows="11" placeholder="请输入笔记内容"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="default" @click="copyNote" plain size="mini">复制</el-button>
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
    export default {
        components: {},
        data() {
            return {
                note: {
                    id: this.$route.query.id,
                    categoryId: this.$route.query.categoryId
                },
                categories: []
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
                    _this.note = _this.$db.get('notes').insert(_this.note).write()
                }
                // 添加到搜索引擎
                electron.ipcRenderer.send('lunr', _this.note)
                // 编辑成功跳转到对应分类
                _this.goToList()
            },
            goToList() {
                let _this = this
                let query = {}
                if (_this.$route.query.categoryId ||
                    (_this.note.state === _this.Constants.STATE.available)) {
                    query.categoryId = _this.$route.query.categoryId
                } else {
                    query.state = _this.note.state
                }
                _this.$router.push({name: 'list', query: query})
            },
            copyNote() {
                Clipboard.copyToClipboard(this.note.context).then(() => {
                    this.$message.success('已复制内容')
                })
            }
        }
    }
</script>

<style>

</style>
