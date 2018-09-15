<template>
    <div>
        <el-col :span="12">
            <el-form label-width="80px">
                <el-form-item label="显示窗体">
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
        <el-col :span="12">

        </el-col>
    </div>
</template>

<script>
    import Config from '../utils/Config'
    import Shortcut from '../utils/Shortcut'
    import electron from 'electron'

    export default {
        data() {
            return {
                setting: {
                    hotkey: {
                        toggleMain: {
                            control: [],
                            key: ''
                        }
                    }
                }
            }
        },
        mounted() {
            let _this = this
            Config.read((conf) => {
                _this.setting = conf
                console.log('读取：', conf)
                _this.$watch('setting.hotkey.toggleMain', {
                    deep: true,
                    handler: function () {
                        Config.save(_this.setting, () => {
                            Shortcut.registShortCut(electron.remote.getCurrentWindow().getParentWindow(), 'toggleMain')
                        })
                    }
                })
            })
        },
        methods: {
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
