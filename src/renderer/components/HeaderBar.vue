<template>
    <div class="header">
        <el-col :span="14">
            <span class="title">Clipnote</span>
        </el-col>
        <el-col :span="10">
            <el-col :span="4">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#clipnote-icon-search"></use>
                </svg>
            </el-col>
            <el-col :span="20">
                <label>
                    <input type="text"
                           v-model="keywords"
                           placeholder="搜索"
                           class="input-search" @keyup="search"/>
                </label>
            </el-col>
        </el-col>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                keywords: ''
            }
        },
        methods: {
            search() {
                this.$router.push({name: 'list', query: {categoryId: '0000000000_default_category', type: 'note'}})
                this.bus.$emit('search', this.keywords)
            }
        }
    }
</script>

<style>
    .header {
        position: relative;
        z-index: 1;
        color: #DCDCDC;
        line-height: 40px;
        background-color: #232323;
        height: 100%;
        box-shadow: 0 4px 10px rgba(0,0,0,.45);
    }

    .header .title {
        padding-left: 10px;
    }

    .header .input-search {
        background-color: #232323;
        border: none;
        border-bottom: 1px solid #323232;
        box-shadow: none;
        color: #FFFFFF;
        width: 100%;
    }

    .input-search:focus {
        border-color: #9C9C9C;
        outline: 0;
    }

</style>
