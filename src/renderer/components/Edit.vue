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
                <el-button type="success" @click="editNote" size="mini">保存</el-button>
                <el-button @click="cancelEdit" size="mini">取消</el-button>
            </el-form-item>
        </el-form>
    </transition>
</template>

<script>
    export default {
        data() {
            return {
                note: {
                    _id: this.$route.query.id,
                    type: 'note',
                    categoryId: this.$route.query.categoryId
                },
                noteTemp: {}
            }
        },
        mounted() {
            let _this = this
            if (_this.note._id) {
                _this.loadNote()
            }
        },
        methods: {
            loadNote() {
                let _this = this
                _this.$db.findOne({
                    _id: _this.note._id
                }, (err, docs) => {
                    if (err) {
                        _this.$message({
                            type: 'error',
                            message: '笔记加载失败：' + err
                        })
                    } else {
                        _this.note = docs
                        _this.noteTemp = JSON.parse(JSON.stringify(docs))
                    }
                })
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
                if (_this.note._id) {
                    _this.$db.update(_this.noteTemp, _this.note, {}, (err, num) => {
                        if (err) {
                            _this.$message({
                                type: 'error',
                                message: '修改笔记失败：' + err
                            })
                        } else {
                            // 添加成功跳转到对应分类
                            _this.$router.push({name: 'list', query: {type: _this.note.type, categoryId: _this.note.categoryId}})
                            _this.$message({
                                type: 'success',
                                message: '修改笔记成功'
                            })
                        }
                    })
                } else {
                    _this.note.time = new Date().getTime()
                    _this.$db.insert(_this.note, (err, newDoc) => {
                        if (err) {
                            _this.$message({
                                type: 'error',
                                message: '添加笔记失败：' + err
                            })
                        } else {
                            // 添加成功跳转到对应分类
                            _this.$router.push({name: 'list', query: {type: _this.note.type, categoryId: _this.note.categoryId}})
                            // _this.$message({
                            //     type: 'success',
                            //     message: '添加笔记成功'
                            // })
                        }
                    })
                }
            },
            cancelEdit() {
                let _this = this
                _this.$router.push({name: 'list', query: {type: _this.note.type, categoryId: _this.note.categoryId}})
            }
        }
    }
</script>

<style>

</style>
