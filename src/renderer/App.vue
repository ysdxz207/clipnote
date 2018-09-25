<template>
    <div id="app">
        <header class="frame-header-bar">
            <i class="el-icon-arrow-down btn-close" @click="hideWindow"></i>
        </header>
        <router-view></router-view>
    </div>
</template>

<script>
    import electron from 'electron'
    export default {
        name: 'clipnote',
        mounted() {
        },
        methods: {
            hideWindow() {
                electron.remote.getCurrentWindow().hide()
            }
        }
    }
</script>

<style lang="scss">
    @import "../../static/assets/fonts/font.css";
    $animationDuration: 0.5s;
    @import "~vue2-animate/src/sass/vue2-animate.scss";

    #app {
        height: 100vh;
    }

    * {
        font-size: 14px;
        font-family: SourceHanSansCN-Normal,serif;
    }

    .icon {
        width: 1em; height: 1em;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
    }

    html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
    }

    body {
        -webkit-user-select: none;
    }

    .frame-header-bar {
        height: 30px;
        line-height: 30px;
        width:100%;
        background-color: #222222;
        opacity: 1;
        -webkit-app-region: drag;
        display: flex;
        flex-direction: row-reverse;
        flex-wrap: nowrap;
        justify-content: right;
        align-items:center;
    }

    .btn-close {
        margin-right: 8px;
        width: 20px;
        height: 20px;
        border-radius: 10px;
        text-align: center;
        line-height: 20px;
        color: #FFFFFF;
        /*float: right;*/
        cursor: pointer;
        opacity: 1;
        background-color: #ff513c;
        -webkit-app-region: no-drag;
    }
    .btn-close:hover {
        background-color: red;
    }

    /*滚动条整体样式*/
    ::-webkit-scrollbar {
        width: 1px;
        height: 4px;
        background-color: transparent;
    }

    /*滚动条里面小方块*/
    ::-webkit-scrollbar-thumb {
        border-radius: 4px;
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        background: rgb(16, 229, 227);
        /*background: rgb(255, 132, 115);*/
    }

    /*滚动条里面轨道*/
    ::-webkit-scrollbar-track {
        border-radius: 4px;
    }

</style>
