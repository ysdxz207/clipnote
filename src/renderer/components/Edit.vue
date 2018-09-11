<template>
    <el-form ref="note" :model="note">
        <el-form-item>
            <el-input v-model="note.title"></el-input>
        </el-form-item>
        <el-form-item>
            <el-input type="textarea" v-model="note.context"></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="editNote">保存</el-button>
            <el-button>取消</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
    export default {
        data() {
            return {
                note: {
                    type: 'note',
                    categoryId: this.$route.query.categoryId
                }
            }
        },
        mounted() {
            let _this = this
            console.log(_this.note)
        },
        methods: {
            editNote() {
                let _this = this
                _this.$db.insert(_this.note, (err, newDoc) => {
                    if (err) {
                        _this.$message({
                            type: 'error',
                            message: '添加笔记失败：' + err
                        })
                    } else {
                        // 添加成功跳转到对应分类
                        _this.$router.push({name: 'list', query: {type: _this.note.type, categoryId: _this.note.categoryId}})
                        _this.$message({
                            type: 'success',
                            message: '添加笔记成功'
                        })
                    }
                })
            }
        }
    }
</script>

<style>
</style>
