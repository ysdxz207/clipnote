<template>
    <div class="el-row">
        <div :span="24">
            <el-input
                    type="textarea"
                    :autosize="{ minRows: 14, maxRows: 20}"
                    placeholder="请输入内容"
                    v-model="json">
            </el-input>
        </div>
        <div :span="24">
            <el-button type="success">成功按钮</el-button>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                json: ''
            }
        },
        mounted() {
        },
        methods: {}
    }
</script>

<style scoped>

</style>
