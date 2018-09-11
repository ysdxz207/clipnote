<template>
    <div class="sidebar">
        <div class="item favourites">
            <i class=""></i> 收藏
        </div>
        <div class="item clipboard">
            剪贴板
        </div>
        <div class="category">
            <el-row>
                <el-col :span="12">分类</el-col>
                <el-col :span="2" :push="8" @click.native="newCategory">+</el-col>
            </el-row>
            <ul>
                <li v-for="(o, index) in categoryList">
                    {{o.name}}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        components: {
        },
        data() {
            return {
                categoryList: []
            }
        },
        mounted() {
            let _this = this
            _this.loadCategoryList()
        },
        methods: {
            loadCategoryList() {
                let _this = this
                _this.$db.find({
                    type: 'category'
                }, (err, docs) => {
                    if (err) {
                        _this.$message({
                            type: 'error',
                            message: '分类加载失败：' + err
                        })
                    } else {
                        _this.categoryList = docs
                    }
                })
            },
            newCategory() {
                let _this = this
                _this.$prompt('请输入分类名', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                }).then(({ value }) => {
                    let doc = {
                        type: 'category',
                        name: value
                    }
                    _this.$db.insert(doc, (err, newDoc) => {
                        if (err) {
                            _this.$message({
                                type: 'error',
                                message: '添加分类失败：' + err
                            })
                        } else {
                            _this.loadCategoryList()
                            _this.$message({
                                type: 'success',
                                message: '添加成功'
                            })
                        }
                    })
                }).catch(() => {
                })
            },
            edit() {
                console.log()
            }
        }
    }
</script>

<style scoped>

    .sidebar {
        height: 100vh;
        font-size: 14px;
        border-right: 1px solid #ECECEC;
    }

    .sidebar .item {
        line-height: 28px;
        border-bottom: 1px solid #DDD;
        padding-left: 10px;
    }


    .sidebar .category {
        line-height: 34px;
        padding-left: 10px;
    }

    .sidebar .category ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .sidebar .category ul li {
        cursor: pointer;
        line-height: 24px;
        font-size: 14px;
    }


</style>
