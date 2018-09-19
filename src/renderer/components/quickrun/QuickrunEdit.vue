<template>
    <transition name="fade">
        <el-form ref="quickrunEdit" class="form-edit-quickrun" :model="shortcut" label-width="40px">
            <el-form-item label="名称">
                <el-input size="mini" v-model="shortcut.name" autofocus></el-input>
            </el-form-item>
            <el-form-item label="路径">
                <el-input size="mini" v-model="shortcut.path"></el-input>
            </el-form-item>
            <el-form-item label="目标">
                <el-input size="mini" v-model="shortcut.target"></el-input>
            </el-form-item>
            <el-form-item label="参数">
                <el-input size="mini" v-model="shortcut.args"></el-input>
            </el-form-item>
            <el-form-item label="图标">
                <img :src="shortcut.icon" height="20" class="edit-img" @click="getIcon"/>
            </el-form-item>
            <el-form-item>
                <el-button type="success" @click="editShortcut" size="mini">保存</el-button>
            </el-form-item>
        </el-form>
    </transition>
</template>

<script>
    import electron from 'electron'
    export default {
        data() {
            return {
                shortcut: {
                },
                shortcutTemp: {}
            }
        },
        created() {
        },
        mounted() {
            electron.ipcRenderer.on('shortcut', (event, id) => {
                this.loadShortcut(id)
            })
        },
        methods: {
            loadShortcut(id) {
                let _this = this
                _this.$db.findOne({
                    type: 'shortcut',
                    id: id
                }, (err, docs) => {
                    if (err) {
                        _this.$message({
                            type: 'error',
                            message: '快捷方式加载失败：' + err
                        })
                    } else {
                        _this.shortcut = docs
                        _this.shortcutTemp = JSON.parse(JSON.stringify(docs))
                    }
                })
            },
            editShortcut() {
                let _this = this
                _this.$db.update(_this.shortcutTemp, _this.shortcut, {}, (err, num) => {
                    if (err) {
                        _this.$message({
                            type: 'error',
                            message: '修改快捷方式失败：' + err
                        })
                    } else {
                        electron.remote.getCurrentWindow().hide()
                    }
                })
            },
            getIcon() {
            }
        }
    }
</script>

<style scoped lang="scss">

    .form-edit-quickrun /deep/ .el-form-item {
        margin-bottom: 0;
    }
    .form-edit-quickrun {
        margin: 10px;
    }
    .edit-img {
        cursor: pointer;
    }
</style>
