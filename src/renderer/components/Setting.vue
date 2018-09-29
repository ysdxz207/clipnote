<template>
    <div>
        <el-col :span="12">
            <el-form label-width="80px">
                <el-form-item label="笔记：">
                    <el-input :value="setting.hotkey.toggleQuickrun"
                              @keydown.native="keyup(setting.hotkey.toggleQuickrun, $event)"
                              size="mini"
                              @blur="onBlur()"
                    ></el-input>
                </el-form-item>
            </el-form>

        </el-col>
        <el-col :span="11">
            <el-form label-width="80px">
                <el-form-item label="quickrun:">
                    <el-row type="flex" justify="space-between">

                    </el-row>
                    <el-row type="flex" justify="space-between">
                        <el-checkbox v-model="setting.quickrun.runShow">启动显示主窗口</el-checkbox>
                    </el-row>
                </el-form-item>
            </el-form>
        </el-col>
    </div>
</template>

<script>
    import Shortcut from '../utils/Shortcut'
    import electron from 'electron'
    // import {mapGetters} from 'vuex'

    const windowManager = electron.remote.require('electron-window-manager')

    export default {
        data() {
            return {
                setting: {
                    hotkey: {},
                    quickrun: {}
                }
            }
        },
        computed: {
            // ...mapGetters('hot-key', ['availableKeyCode', 'keyCode2RegisterKey'])
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
                        'toggleMain', _this.setting.hotkey.toggleMain)) {
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
                }
            })
            _this.$watch('setting.quickrun', {
                deep: true,
                handler: function () {
                    // 重新读取，以防覆盖其他值
                    _this.$db.read()
                    // 部分修改，以防覆盖其他值
                    _this.$db.set('config.quickrun', _this.setting.quickrun).write()
                }
            })
        },
        methods: {
            keyup(key, event) {
                console.log(event)
                event.preventDefault()
                let rs
                if (event.keyCode === 0) { // 删除键 直接清空
                    rs = ''
                } else {
                    let comboKey = []
                    if (event.shiftKey) {
                        comboKey.push('Shift')
                    }
                    if (event.altKey) {
                        comboKey.push('Alt')
                    }
                    if (event.metaKey) {
                        comboKey.push('Command')
                    }
                    if (event.ctrlKey) {
                        comboKey.push('Control')
                    }
                    comboKey.push(event.key)
                    rs = Array.from(new Set(comboKey)).join('+')
                }

                this.setting.hotkey.toggleQuickrun = rs
            },
            onBlur() {
                let _this = this
                let windowObj = windowManager.get(_this.Constants.NAME.QUICKRUN).object
                console.log('quickru window', windowObj)
                if (Shortcut.registShortCut(windowObj,
                    'toggleQuickrun', _this.setting.hotkey.toggleQuickrun)) {
                } else {
                    _this.$message.error('快捷键可能已被占用')
                }
            }
        }
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
