<template>
    <div class="preview">
        <img :src="pic"/>
    </div>
</template>

<script>
    import electron from 'electron'
    const Mousetrap = require('mousetrap')
    export default {
        data() {
            return {
                pic: ''
            }
        },
        created() {
        },
        mounted() {
            let _this = this
            electron.ipcRenderer.on('pic', (event, pic) => {
                _this.pic = pic
            })
            // ESC
            Mousetrap.bind(['esc'], (e) => {
                _this.onEscKey(e)
                // 返回 false 以防止默认行为，并阻止事件冒泡
                return false
            })
            // 隐藏header
            _this.bus.$emit('show-header', false)
        },
        methods: {
            onEscKey(e) {
                let _this = this
                if (e.which === 27) {
                    _this.pic = ''
                    electron.remote.getCurrentWindow().hide()
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .preview {
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.29);
    }
    .preview img {
        margin: auto;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

</style>
