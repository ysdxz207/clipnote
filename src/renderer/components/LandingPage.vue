<template>
    <el-container class="container-main">
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
        <canvas id="canvas_background"></canvas>
    </el-container>
</template>

<script>
    import HeaderBar from './HeaderBar'
    import SideBar from './SideBar'
    import Clipboard from '../utils/Clipboard'

    export default {
        name: 'landing-page',
        components: {
            HeaderBar,
            SideBar
        },
        created() {
            let _this = this
            _this.bus.$on('configChange', function (type) {
                if (type === 'clipboardCollection') {
                    // 读取配置监听收集剪贴板
                    Clipboard.watchOrUnWatch()
                }
            })
        },
        mounted() {
            // 读取配置监听收集剪贴板
            Clipboard.watchOrUnWatch()
            this.setCanvasBackground()
        },
        methods: {
            open(link) {
                this.$electron.shell.openExternal(link)
            },
            setCanvasBackground() {
                let canvas = document.querySelector('#canvas_background')
                let context = canvas.getContext('2d')

                canvas.width = window.innerWidth
                canvas.height = window.innerHeight

                let img = new Image()
                img.src = '../../../static/assets/images/bg_main.png'
                img.onload = drawImg

                function drawImg() {
                    context.drawImage(img, 0, 0, canvas.width, canvas.height)
                }
            }
        }
    }
</script>

<style lang="scss">

    .container-main {
        position: relative;
        height: 100%;
    }

    .el-header {
        padding: 0;
    }

    .el-main {
        padding: 24px 14px;
        background-color: #F8F8F8;
        height: 100%;
    }

    #canvas_background {
        position: absolute;
        z-index: 2;
        pointer-events: none;
        opacity: 0.22;
        filter: contrast(60%);
    }
</style>
