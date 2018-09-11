<template>
    <div class="header">
        <el-col :span="12">

        </el-col>
        <el-col :span="12">
            <label>
                <i class=""></i>
                <input type="text" placeholder="搜索" class="input-search"/>
            </label>
        </el-col>
    </div>
</template>

<script>
    export default {
        methods: {
        }
    }
</script>

<style>
    .header {
        color: #DCDCDC;
        line-height: 40px;
        background-color: #232323;
        height: 100%;
    }

    .header .input-search {
        background-color: #232323;
        border: none;
        border-bottom: 1px solid #9C9C9C;
        box-shadow: none;
        color: #FFFFFF;
    }

    .input-search:focus {
        border-color: #DDDDDD;
        outline: 0;
    }

</style>
