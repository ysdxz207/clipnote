<template>
    <header class="frame-header-bar" v-if="showHeader">
        <i class="el-icon-arrow-down btn-close" @click="hideWindow"></i>
    </header>
</template>

<script>
    import electron from 'electron'
    export default {
        data() {
            return {
                showHeader: true
            }
        },
        mounted() {
            let _this = this
            _this.bus.$on('show-header', showHeader => {
                _this.showHeader = showHeader
            })
        },
        methods: {
            hideWindow() {
                electron.remote.getCurrentWindow().hide()
            }
        }
    }
</script>

<style scoped type="scss">
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

</style>
