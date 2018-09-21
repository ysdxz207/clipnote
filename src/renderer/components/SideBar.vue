<template>
    <div class="sidebar">
        <div>
            <div class="item" :class="activeSidebar === recycleId ? 'active' : ''"
                 @click="showItemList(recycleId, 'note')">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#clipnote-icon-recycle"></use>
                </svg>
                <span class="title">回收站</span>
            </div>
            <div class="item" :class="activeSidebar === favouritesId ? 'active' : ''"
                 @click="showItemList(favouritesId, 'note')">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#clipnote-icon-favourite"></use>
                </svg>
                <span class="title">收藏夹</span>
            </div>
            <div class="item" :class="activeSidebar === clipboardId ? 'active' : ''">
                <el-col :span="12" @click.native="showItemList(clipboardId, 'note')">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#clipnote-icon-clipboard"></use>
                    </svg>
                    <span class="title">剪贴板</span>
                </el-col>
                <el-col :span="2" :push="4">
                    <el-switch
                            title="收集剪贴板开关"
                            v-model="conf.clipboardCollection"
                            active-color="#13ce66"
                            inactive-color="#ff4949">
                    </el-switch>
                </el-col>
            </div>
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
            <transition-group enter-active-class="bounceInLeft"
                              tag="ul">
                <li v-for="(o, index) in categoryList"
                    :key="index"
                    :class="o._id === activeSidebar ? 'active' : ''">
                    <span class="name" @click="showItemList(o._id, 'note')">{{o.name}}</span>
                    <span class="btn-delete"
                          @click="deleteCategory(o._id)"
                          v-if="o._id !== defaultCategoryId">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#clipnote-icon-delete1"></use>
                        </svg>
                    </span>
                </li>
            </transition-group>
        </div>
    </div>
</template>

<script>
    import Config from '../utils/Config'

    export default {
        components: {},
        data() {
            return {
                defaultCategoryId: '0000000000_default_category',
                recycleId: 'recycle',
                favouritesId: 'favourites',
                clipboardId: 'clipboard',
                activeSidebar: '',
                categoryList: [],
                conf: {}
            }
        },
        watch: {
            '$route'(to, from) {
                let categoryId = this.$route.query.categoryId
                if (categoryId) {
                    this.activeSidebar = categoryId
                }
            }

        },
        create() {
        },
        mounted() {
            let _this = this
            // 初始化[全部]分类
            _this.initDefaultCategory()
            _this.loadCategoryList((categoryList) => {
                // 默认打开第一个分类下列表
                if (categoryList[0]) {
                    _this.showItemList(categoryList[0]._id, 'note')
                }
            })
            // 选中第一个分类
            _this.activeSidebar = _this.$route.query.categoryId
            // 是否开启剪贴板收集功能
            setTimeout(_this.loadClipboardCollection(), 2000)
        },
        methods: {
            initDefaultCategory() {
                let _this = this
                let defaultCategory = {
                    type: 'category',
                    _id: _this.defaultCategoryId,
                    time: 999999999999999
                }
                _this.$db.find(defaultCategory, (err, docs) => {
                    if (err) {
                        _this.$message({
                            type: 'error',
                            message: '默认分类初始化失败(查询)：' + err
                        })
                    } else {
                        if (!docs || docs.length === 0) {
                            defaultCategory.name = '全部笔记'
                            _this.$db.insert(defaultCategory, (err, newDoc) => {
                                if (err) {
                                    _this.$message({
                                        type: 'error',
                                        message: '默认分类初始化失败：' + err
                                    })
                                } else {
                                    _this.loadCategoryList((categoryList) => {
                                        // 默认打开第一个分类下列表
                                        if (categoryList[0]) {
                                            _this.showItemList(categoryList[0]._id, 'note')
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            },
            loadCategoryList(callback) {
                let _this = this
                _this.$db.find({
                    type: 'category'
                }).sort({
                    time: -1
                }).exec((err, docs) => {
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
                }).then(({value}) => {
                    if (!value) {
                        _this.$message({
                            type: 'warning',
                            message: '请输入分类名'
                        })
                        return
                    }
                    if (value.length > 10) {
                        _this.$message({
                            type: 'warning',
                            message: '分类名长度最大为10'
                        })
                        return
                    }
                    let doc = {
                        type: 'category',
                        name: value,
                        time: new Date().getTime()
                    }
                    _this.$db.insert(doc, (err, newDoc) => {
                        if (err) {
                            _this.$message({
                                type: 'error',
                                message: '添加分类失败：' + err
                            })
                        } else {
                            _this.loadCategoryList()
                            // 新增分类成功跳转到当前分类列表
                            _this.$router.push({name: 'list', query: {categoryId: newDoc._id, type: 'note'}})
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
            },
            deleteCategory(id) {
                let _this = this
                _this.$confirm('删除分类后，此分类下笔记将转移到回收站，确定删除此分类吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    _this.$db.remove({_id: id}, {}, (err, numRemoved) => {
                        if (err) {
                            _this.$message({
                                type: 'error',
                                message: '删除分类失败：' + err
                            })
                        } else {
                            _this.loadCategoryList((categoryList) => {
                                // 转移当前分类下内容到回收站
                                _this.$db.find({
                                    categoryId: id,
                                    type: 'note'
                                }, (err, docs) => {
                                    if (err) {
                                        _this.$message({
                                            type: 'error',
                                            message: '转移分类下笔记失败(查询)：' + err
                                        })
                                    } else {
                                        docs.forEach((o, index) => {
                                            let oTemp = JSON.parse(JSON.stringify(o))
                                            o.categoryId = _this.recycleId
                                            _this.$db.update(oTemp, o, {}, (err, numReplaced) => {
                                                if (err) {
                                                    _this.$message({
                                                        type: 'error',
                                                        message: '转移分类下笔记失败：' + err
                                                    })
                                                }
                                            })
                                        })
                                        // 删除分类完成回到默认分类下
                                        _this.$router.push({
                                            name: 'list',
                                            query: {categoryId: _this.defaultCategoryId, type: 'note'}
                                        })
                                    }
                                })
                            })
                            // _this.$message({
                            //     type: 'success',
                            //     message: '删除成功'
                            // })
                        }
                    })
                }).catch(() => {
                })
            },
            loadClipboardCollection() {
                let _this = this
                Config.read().then((config) => {
                    _this.conf = config
                    _this.$watch('conf.clipboardCollection', {
                        deep: true,
                        handler: function () {
                            console.log('change clipboardCollection')
                            Config.save(_this.conf).then(() => {
                                _this.bus.$emit('configChange', 'clipboardCollection')
                            }).catch(err => {
                                console.error(err)
                            })
                        }
                    })
                }).catch(err => {
                    console.error(err)
                })
            }
        }
    }
</script>

<style scoped>

    .sidebar {
        height: 100vh;
        font-size: 14px;
        border-right: 1px solid #ECECEC;
        background-color: #FAFAFA;

        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex-wrap: nowrap;
        justify-content: stretch;
    }

    .sidebar .active {
        background-color: rgb(255, 201, 177);
    }

    .sidebar .item {
        height: 28px;
        line-height: 28px;
        border-bottom: 1px solid #DDD;
        padding-left: 16px;
        cursor: pointer;
    }

    .sidebar .category {
        line-height: 34px;

        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex-wrap: nowrap;
        justify-content: stretch;
    }

    .sidebar .category ul {
        list-style: none;
        margin: 0;
        padding: 0;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .sidebar .category ul li {
        height: 24px;
        line-height: 24px;
        font-size: 14px;
        padding-left: 10px;
    }

    .sidebar .title {
        padding-left: 20px;
    }

    .sidebar .name {
        display: inline-block;
        width: 70%;
        cursor: pointer;
        float: left;
    }

    .sidebar .btn-delete {
        display: inline-block;
        float: right;
        margin-right: 10px;
        cursor: pointer;
    }
</style>
