<template>
    <el-container style="height: 100%">
        <el-aside width="200px">
            <side-bar></side-bar>
        </el-aside>
        <el-container>
            <el-header height="44px">
                <header-bar></header-bar>
            </el-header>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    import HeaderBar from './HeaderBar'
    import SideBar from './SideBar'
    import Config from '../utils/Config'

    export default {
        name: 'landing-page',
        components: {
            HeaderBar,
            SideBar
        },
        created() {
            let _this = this
            _this.bus.$on('configChange', function () {
                // 读取配置监听收集剪贴板
                _this.startWatchingCollectionClipboard()
            })
        },
        mounted() {
            let _this = this
            // 初始化配置
            Config.save()
            // 读取配置监听收集剪贴板
            _this.startWatchingCollectionClipboard()
        },
        methods: {
            open(link) {
                this.$electron.shell.openExternal(link)
            },
            startWatchingCollectionClipboard() {
                let _this = this
                Config.read((config) => {
                    if (!config.clipboardCollection) {
                        _this.clipboard.off('text-changed')
                        _this.clipboard.off('image-changed')
                        _this.clipboard.stopWatching()
                        return
                    }
                    _this.clipboard
                        .on('text-changed', () => {
                            let currentText = _this.clipboard.readText()
                            if (currentText.replace(/\s+/g, '').replace(/[\r\n]/g, '').length === 0) {
                                return
                            }
                            _this.$db.insert({
                                categoryId: 'clipboard',
                                type: 'note',
                                context: currentText,
                                title: currentText.substring(0, 20),
                                time: new Date().getTime()
                            }, (err, newDoc) => {
                                if (err) {
                                    _this.$message({
                                        type: 'error',
                                        message: '收集粘贴板失败：' + err
                                    })
                                }
                            })
                        })
                        .on('image-changed', () => {
                            let currentIMage = _this.clipboard.readImage()
                            console.log(currentIMage)
                        })
                        .startWatching()
                })
            }
        }
    }
</script>

<style lang="scss">

    .el-header {
        padding: 0;
    }

    .el-main {
        padding: 24px 14px;
        background-color: #F8F8F8;
        height: 100%;
    }
</style>
