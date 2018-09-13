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

    export default {
        name: 'landing-page',
        components: {
            HeaderBar,
            SideBar
        },
        mounted() {
            let _this = this
            const clipboard = require('electron-clipboard-extended')

            clipboard
                .on('text-changed', () => {
                    let currentText = clipboard.readText()
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
                    let currentIMage = clipboard.readImage()
                    console.log(currentIMage)
                })
                .startWatching()
        },
        methods: {
            open(link) {
                this.$electron.shell.openExternal(link)
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
