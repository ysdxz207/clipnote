<template>
    <div>
        <el-input
                type="textarea"
                :autosize="{ minRows: 14, maxRows: 20}"
                placeholder="请输入内容"
                v-model="textarea3">
        </el-input>
        <el-button type="success">成功按钮</el-button>
    </div>
</template>

<script>
    export default {
        data() {
            return {
            }
        },
        mounted() {
        },
        methods: {}
    }
</script>

<style scoped>

</style>
