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

    html, body {
        margin: 0;
        padding: 0;
    }

    /*滚动条整体样式*/
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
        background-color: transparent;
    }

    /*滚动条里面小方块*/
    ::-webkit-scrollbar-thumb {
        border-radius: 8px;
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        background: rgb(92, 101, 110);
        /*background: rgb(255, 132, 115);*/
    }

    /*滚动条里面轨道*/
    ::-webkit-scrollbar-track {
        border-radius: 8px;
    }

</style>
