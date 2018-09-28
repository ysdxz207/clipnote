<template>
    <div class="sidebar">
        <div>
            <div class="item" :class="activeSidebar === Constants.STATE.recycle ? 'active' : ''"
                 @click="showItemList(Constants.STATE.recycle)">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#clipnote-icon-recycle"></use>
                </svg>
                <span class="title">回收站</span>
            </div>
            <div class="item" :class="activeSidebar === Constants.STATE.favourite ? 'active' : ''"
                 @click="showItemList(Constants.STATE.favourite)">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#clipnote-icon-favourite"></use>
                </svg>
                <span class="title">收藏夹</span>
            </div>
            <div class="item" :class="activeSidebar === Constants.STATE.clipboard ? 'active' : ''">
                <el-col :span="12" @click.native="showItemList(Constants.STATE.clipboard)">
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
            <el-row class="item" style="cursor: default;">
                <el-col :span="12">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#clipnote-icon-category"></use>
                    </svg>
                    <span class="title">分类</span>
                </el-col>
                <el-col :span="2" :push="8" @click.native="editCategory">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#clipnote-icon-add"></use>
                    </svg>
                </el-col>
            </el-row>
            <transition-group enter-active-class="bounceInLeft"
                              tag="ul">
                <li v-for="(o, index) in categoryList"
                    :key="index"
                    :class="(o.id === activeSidebar) ? 'active' : ''">
                    <span class="name" @click="showItemList(null, o.id)">{{o.name}}</span>
                    <span class="btn-group">
                        <svg class="icon" aria-hidden="true" @click="editCategory(o.id)"
                             v-if="o.id !== Constants.ID.defaultCategoryId">
                            <use xlink:href="#clipnote-icon-edit-category"></use>
                        </svg>
                        <svg class="icon" aria-hidden="true" @click="deleteCategory(o.id)"
                             v-if="o.id !== Constants.ID.defaultCategoryId">
                            <use xlink:href="#clipnote-icon-delete1"></use>
                        </svg>
                    </span>
                </li>
            </transition-group>
        </div>
    </div>
</template>

<script>
    export default {
        components: {},
        data() {
            return {
                activeSidebar: this.Constants.ID.defaultCategoryId,
                categoryList: [],
                conf: {}
            }
        },
        watch: {
            '$route'(to, from) {
                let state = this.$route.query.state || this.Constants.STATE.available
                if (state === this.Constants.STATE.available || this.$route.query.categoryId === this.Constants.ID.defaultCategoryId) {
                    this.activeSidebar = this.$route.query.categoryId
                } else {
                    this.activeSidebar = state
                }
            }

        },
        create() {
        },
        mounted() {
            let _this = this
            _this.loadCategoryList()
            // 选中并加载全部笔记分类
            _this.showItemList(null, _this.Constants.ID.defaultCategoryId)
            // 是否开启剪贴板收集功能
            setTimeout(_this.loadClipboardCollection(), 2000)
        },
        methods: {
            loadCategoryList() {
                let _this = this
                _this.categoryList = _this.$db.get('categories').filter({show: true}).sortBy('time').cloneDeep().value().reverse()
            },
            editCategory(categoryId) {
                let _this = this
                let collections = _this.$db.get('categories')
                let isNew = !!categoryId
                let category
                if (isNew) {
                    category = collections.find({id: categoryId}).cloneDeep().value()
                }
                _this.$prompt('请输入分类名', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputValue: category && category.name
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
                    if (!isNew) {
                        category.name = value
                        collections.assign(category).write()
                    } else {
                        category = {
                            show: true,
                            name: value,
                            time: new Date().getTime()
                        }
                        let newDoc = collections.insert(category).write()
                        categoryId = newDoc.categoryId
                    }
                    _this.loadCategoryList()
                    // 新增分类成功跳转到当前分类列表
                    _this.$router.push({name: 'list', query: {categoryId: categoryId}})
                }).catch(e => {
                    console.log('cancel')
                })
            },
            showItemList(state, categoryId) {
                let query = {}
                if (categoryId) {
                    query.categoryId = categoryId
                }
                if (state) {
                    query.state = state
                }
                this.$router.push({name: 'list', query: query})
            },
            deleteCategory(id) {
                let _this = this
                _this.$confirm('删除分类后，此分类下笔记将转移到回收站，确定删除此分类吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 删除分类
                    _this.$db.get('categories').remove({id: id}).write()
                    // 重新加载分类列表
                    _this.loadCategoryList()
                    // 转移当前分类下内容到回收站
                    let noteList = _this.$db.get('notes').filter({
                        categoryId: id
                    }).value()
                    noteList.forEach((o, index) => {
                        o.state = _this.Constants.STATE.recycle
                        _this.$db.get('categories').find({id: o.id}).assign(o).write()
                    })
                    // 删除分类完成回到默认分类下
                    _this.$router.push({
                        name: 'list',
                        query: {categoryId: _this.Constants.ID.defaultCategoryId}
                    })
                }).catch(() => {
                })
            },
            loadClipboardCollection() {
                let _this = this
                _this.conf = _this.$db.get('config').cloneDeep().value()
                _this.$watch('conf.clipboardCollection', {
                    deep: true,
                    handler: function () {
                        _this.$db.update('config', (o) => {
                            return _this.conf
                        }).write()
                        _this.bus.$emit('configChange', 'clipboardCollection')
                    }
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
        background-color: rgb(190, 248, 255);
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
    }

    .sidebar .btn-group {
        display: inline-block;
        margin-right: 10px;
        cursor: pointer;
        float: right;
    }
</style>
