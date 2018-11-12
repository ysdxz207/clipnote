<template>
    <div class="header">
        <el-col :span="14">
            <span class="title">Clipnote</span>
            <span class="title" @click="showJf">jf</span>
        </el-col>
        <el-col :span="10">
            <el-col :span="4" style="text-align: right">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#clipnote-icon-search"></use>
                </svg>
            </el-col>
            <el-col :span="20">
                <label>
                    <input type="text"
                           v-model="keywords"
                           placeholder="搜索"
                           class="input-search"/>
                </label>
            </el-col>
        </el-col>
    </div>
</template>

<script>
    import electron from 'electron'
    let windowManager = electron.remote.require('electron-window-manager')
    export default {
        data() {
            return {
                keywords: '',
                jfWindow: null
            }
        },
        watch: {
            'keywords': function(newVal, oldVal) {
                this.search()
            }
        },
        methods: {
            search() {
                this.bus.$emit('search', this.keywords)
            },
            showJf() {
                let _this = this
                let jfWindow = windowManager.get(_this.Constants.NAME.JSON_FORMATTER).object
                if (jfWindow) {
                    _this.jfWindow = jfWindow
                    _this.jfWindow.show()
                    _this.jfWindow.focus()
                }
            }
        }
    }
</script>

<style>
    .header {
        position: relative;
        z-index: 1;
        color: #232323;
        line-height: 40px;
        background-color: #FAFAFA;
        height: 100%;
        box-shadow: 0 1px 4px rgba(0,0,0,.25);
    }

    .header .title {
        padding-left: 10px;
        font-weight: bold;
        font-size: 20px;
    }

    .header .input-search {
        background-color: #FAFAFA;
        border: none;
        border-bottom: 1px solid #DDDDDD;
        box-shadow: none;
        color: #232323;
        width: 100%;
    }

    .input-search:focus {
        border-color: #636363;
        outline: 0;
    }

    .input-search::-webkit-input-placeholder{
        color: #DADADA;
    }

</style>
