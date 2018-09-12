<template>
    <el-container>
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
    }
</style>
