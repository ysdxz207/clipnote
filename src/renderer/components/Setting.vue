<template>
    <div>
        <el-col :span="12">
            <el-form label-width="80px">
                <el-form-item label="笔记：">
                    <el-row type="flex" justify="space-between">
                        <el-col>
                            <el-checkbox-group v-model="setting.hotkey.toggleMain.control">
                                <el-checkbox label="CmdOrCtrl"></el-checkbox>
                                <el-checkbox label="Shift"></el-checkbox>
                                <el-checkbox label="Alt"></el-checkbox>
                            </el-checkbox-group>
                        </el-col>
                        <el-col style="text-align: center">
                            +
                        </el-col>
                        <el-col>
                            <el-input size="mini" v-model="setting.hotkey.toggleMain.key"></el-input>
                        </el-col>
                    </el-row>
                </el-form-item>
            </el-form>

        </el-col>
        <el-col :span="11">
            <el-form label-width="80px">
                <el-form-item label="quickrun:">
                    <el-row type="flex" justify="space-between">
                        <el-col>
                            <el-checkbox-group v-model="setting.hotkey.toggleQuickrun.control">
                                <el-checkbox label="CmdOrCtrl"></el-checkbox>
                                <el-checkbox label="Shift"></el-checkbox>
                                <el-checkbox label="Alt"></el-checkbox>
                            </el-checkbox-group>
                        </el-col>
                        <el-col style="text-align: center">
                            +
                        </el-col>
                        <el-col>
                            <el-input size="mini" v-model="setting.hotkey.toggleQuickrun.key"></el-input>
                        </el-col>
                    </el-row>
                </el-form-item>
            </el-form>
        </el-col>
    </div>
</template>

<script>
    import Shortcut from '../utils/Shortcut'
    import electron from 'electron'

    const windowManager = electron.remote.require('electron-window-manager')

    export default {
        data() {
            return {
                setting: {
                    hotkey: {
                        toggleMain: {
                            control: [],
                            key: ''
                        },
                        toggleQuickrun: {
                            control: [],
                            key: ''
                        }
                    }
                }
            }
        },
        mounted() {
            let _this = this
            _this.setting = _this.$db.get('config').cloneDeep().value()
            _this.$watch('setting.hotkey.toggleMain', {
                deep: true,
                handler: function () {
                    console.log('-----------------')
                    let windowObj = electron.remote.getCurrentWindow().getParentWindow()
                    if (Shortcut.registShortCut(windowObj,
                        'toggleMain', _this.setting)) {
                    } else {
                        _this.$message({
                            type: 'error',
                            message: '快捷键可能已被占用',
                            showClose: true
                        })
                    }
                }
            })
            _this.$watch('setting.hotkey.toggleQuickrun', {
                deep: true,
                handler: function () {
                    console.log('============')
                    let windowObj = windowManager.get(_this.Constants.NAME.QUICKRUN).object
                    console.log('quickru window', windowObj)
                    if (Shortcut.registShortCut(windowObj,
                        'toggleQuickrun', _this.setting)) {
                    } else {
                        _this.$message.error('快捷键可能已被占用')
                    }
                }
            })
        },
        methods: {}
    }
</script>

<style scoped>

    .el-checkbox-group {
        display: inline-block;
    }

    .el-input {
        display: inline-block;
    }

    .el-checkbox {
        display: block;
        margin-left: 0;
        line-height: 0;
    }

</style>
