<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        name: 'clipnote'
    }
</script>

<style lang="scss">
    @import "./assets/fonts/font.css";
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
        overflow: hidden;
    }

    /*滚动条整体样式*/
    ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
        background-color: transparent;
    }

    /*滚动条里面小方块*/
    ::-webkit-scrollbar-thumb {
        border-radius: 4px;
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        background: rgb(26, 28, 31);
        /*background: rgb(255, 132, 115);*/
    }

    /*滚动条里面轨道*/
    ::-webkit-scrollbar-track {
        border-radius: 4px;
    }

</style>
