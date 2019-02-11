<template>
    <img :src="src"/>
</template>

<script>
    import electron from 'electron'
    export default {
        data() {
            return {
                src: ''
            }
        },
        created() {
        },
        mounted() {
            electron.ipcRenderer.on('pic', (event, pic) => {
                this.src = pic
            })
            // ESC
            document.removeEventListener('keydown', this.onEscKey)
            document.addEventListener('keydown', this.onEscKey)
        },
        methods: {
            onEscKey(e) {
                if (e.which === 27) {
                    electron.remote.getCurrentWindow().hide()
                }
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
