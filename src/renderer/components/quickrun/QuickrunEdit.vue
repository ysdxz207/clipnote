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
                <el-button type="danger" @click="deleteShortcut" size="mini">删除</el-button>
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
            electron.ipcRenderer.on('shortcut', (event, shortcut) => {
                this.shortcutTemp = JSON.parse(JSON.stringify(shortcut))
                this.shortcut = shortcut
            })
            // ESC
            document.removeEventListener('keydown', this.onEscKey)
            document.addEventListener('keydown', this.onEscKey)
        },
        methods: {
            editShortcut() {
                let _this = this
                electron.ipcRenderer.send('shortcutEdit', {
                    source: _this.shortcutTemp,
                    target: _this.shortcut
                })
                electron.remote.getCurrentWindow().hide()
            },
            deleteShortcut() {
                let _this = this
                electron.remote.dialog.showMessageBox(electron.remote.getCurrentWindow(), {
                    type: 'error',
                    title: '提示',
                    message: '确定删除此快捷方式吗？',
                    buttons: ['确定', '取消'],
                    cancelId: -1,
                    defaultId: 1
                }, (index) => {
                    if (index === 0) {
                        electron.ipcRenderer.send('shortcutDelete', _this.shortcutTemp)
                        electron.remote.getCurrentWindow().hide()
                    }
                })
            },
            getIcon() {
                let _this = this
                electron.remote.dialog.showOpenDialog(electron.remote.getCurrentWindow(), {
                    title: '选择图标',
                    properties: ['openFile'],
                    filters: [
                        {name: 'Images', extensions: ['jpg', 'png', 'gif', 'ico']}
                    ]
                }, function (filePaths) {
                    let base64 = require('fs').readFileSync(filePaths[0]).toString('base64')
                    if (base64) {
                        base64 = 'data:image/png;base64,' + base64
                        _this.shortcut.icon = base64
                    }
                })
            },
            onEscKey(e) {
                if (e.which === 27) {
                    electron.remote.getCurrentWindow().hide()
                }
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
