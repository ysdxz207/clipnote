<template>
    <div class="sidebar">
        <div class="item favourites">
            <svg class="icon" aria-hidden="true">
                <use xlink:href="#clipnote-icon-favourite"></use>
            </svg>
            <span class="title">收藏夹</span>
        </div>
        <div class="item clipboard">
            <svg class="icon" aria-hidden="true">
                <use xlink:href="#clipnote-icon-clipboard"></use>
            </svg>
            <span class="title">剪贴板</span>
        </div>
        <div class="category">
            <el-row class="item">
                <el-col :span="12">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#clipnote-icon-category"></use>
                    </svg>
                    <span class="title">分类</span>
                </el-col>
                <el-col :span="2" :push="8" @click.native="newCategory">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#clipnote-icon-add"></use>
                    </svg>
                </el-col>
            </el-row>
            <transition-group name="bounce"
                              enter-active-class="bounceInLeft"
                              leave-active-class="bounceOutRight"
                              tag="ul">
                <li v-for="(o, index) in categoryList"
                    :key="index"
                    @click="showItemList(o._id, 'note')"
                    :class="o._id === activeSidebar ? 'active' : ''">
                    {{o.name}}
                </li>
            </transition-group>
        </div>
    </div>
</template>

<script>
    export default {
        components: {
        },
        data() {
            return {
                activeSidebar: '',
                categoryList: []
            }
        },
        watch: {
            '$route' (to, from) {
                let categoryId = this.$route.query.categoryId
                if (categoryId) {
                    this.activeSidebar = categoryId
                }
            }

        },
        mounted() {
            let _this = this
            _this.loadCategoryList((categoryList) => {
                // 默认打开第一个分类下列表
                if (categoryList[0]) {
                    _this.showItemList(categoryList[0]._id, 'note')
                }
            })
            // 选中第一个分类
            _this.activeSidebar = _this.$route.query.categoryId
        },
        methods: {
            loadCategoryList(callback) {
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
                        if (callback) {
                            callback(_this.categoryList)
                        }
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
                            // _this.$message({
                            //     type: 'success',
                            //     message: '添加成功'
                            // })
                        }
                    })
                }).catch(() => {
                })
            },
            showItemList(_id, type) {
                this.$router.push({name: 'list', query: {categoryId: _id, type: type}})
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

    .sidebar .active {
        background-color: rgb(255, 201, 177);
    }

    .sidebar .item {
        line-height: 28px;
        border-bottom: 1px solid #DDD;
        padding-left: 16px;
        cursor: pointer;
    }


    .sidebar .category {
        line-height: 34px;
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
        padding-left: 10px;
    }

    .sidebar .title {
        padding-left: 20px;
    }

</style>
