<template>
    <transition enter-active-class="bounceIn" leave-active-class="zoomOutTop">
        <el-form ref="note" :model="note">
            <el-form-item>
                <el-input size="mini" v-model="note.title" autofocus placeholder="请输入笔记标题"></el-input>
            </el-form-item>
            <el-form-item>
                <el-input type="textarea"
                          v-model="note.context"
                          rows="12" placeholder="请输入笔记内容"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="default" @click="copyNote" plain size="mini">复制</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="success" @click="editNote" size="mini">保存</el-button>
                <el-button @click="cancelEdit" size="mini">取消</el-button>
            </el-form-item>
        </el-form>
    </transition>
</template>

<script>
    import electron from 'electron'
    import Clipboard from '../utils/Clipboard'
    export default {
        data() {
            return {
                note: {
                    id: this.$route.query.id,
                    categoryId: this.$route.query.categoryId
                }
            }
        },
        mounted() {
            let _this = this
            if (_this.note.id) {
                _this.loadNote()
            }
        },
        methods: {
            loadNote() {
                let _this = this
                _this.note = _this.$db.get('notes').find({
                    id: _this.note.id
                }).value()
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
                    _this.note.recycle = false
                    _this.note.time = new Date().getTime()
                    _this.note = _this.$db.get('notes').insert(_this.note).write()
                }
                // 添加到搜索引擎
                electron.ipcRenderer.send('lunr', _this.note)
                // 编辑成功跳转到对应分类
                _this.$router.push({name: 'list', query: {categoryId: _this.note.categoryId}})
            },
            cancelEdit() {
                let _this = this
                _this.$router.push({name: 'list', query: {categoryId: _this.note.categoryId}})
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
