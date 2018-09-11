<template>
    <el-container>
        <el-aside width="26vw">
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

<style>

    .el-header {
        padding: 0;
    }
</style>
