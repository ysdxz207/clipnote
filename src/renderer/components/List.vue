<template>
    <div class="list">
        <ul v-if="results.length > 0" class="list-ul">
            <li v-for="(item, index) in results"
                :key="index">
                <span class="item-title-group" title="点击编辑笔记" @click="editNote(item.id)">
                    <span class="item-title">{{item.title.length > 20 ? (item.title.substring(0, 20) + '...') : item.title}}</span>
                </span>
                <span class="item-btn-group">
                    <span class="btn-favourite" title="复制标题" @click="copyNoteTitle(item.title)">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#clipnote-icon-copy"></use>
                        </svg>
                    </span>
                    <span class="btn-favourite" v-if="item.categoryId !== Constants.ID.recycleId" title="添加/取消收藏" @click="favouriteNote(item)">
                        <i class="element-icons clipnote-icon-favourite"
                           :style="item.favourite ? 'color: yellow' : 'color: grey'"></i>
                    </span>
                    <span class="btn-del" title="删除笔记" @click="deleteNote(item)">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#clipnote-icon-delete"></use>
                        </svg>
                    </span>
                </span>
            </li>
        </ul>
        <div v-else class="no-data">
            这里啥也没有
        </div>
        <div style="margin-top: 30px;text-align: center">
            <el-pagination
                    v-if="pageCount > pageSize"
                    :page-size="pageSize"
                    layout="prev, pager, next"
                    :total="pageCount"
                    @current-change="pageCurrentChangeHandler">
            </el-pagination>
        </div>
        <el-button class="btn-edit"
                   type="success"
                   icon="el-icon-edit"
                   circle
                   @click.native="editNote()"
                   title="写笔记"
                   v-if="$route.query.categoryId !== Constants.ID.defaultCategoryId"></el-button>
    </div>
</template>

<script>
    import FuzzySearch from 'fuzzy-search'
    import Clipboard from '../utils/Clipboard'
    export default {
        data() {
            return {
                categoryId: this.$route.query.categoryId || this.Constants.ID.defaultCategoryId,
                itemList: [],
                results: [],
                pageSize: 20,
                pageCurrent: 1,
                pageCount: 0,
                keywords: '',
                searcher: null
            }
        },
        watch: {
            '$route'(to, from) {
                this.categoryId = this.$route.query.categoryId || this.Constants.ID.defaultCategoryId
                this.loadItemList()
            },
            'pageCurrent' (newValue, oldValue) {
                this.loadItemList()
            }
        },
        created() {
            let _this = this
            _this.bus.$on('search', function (keywords) {
                _this.keywords = keywords
                _this.pageCurrent = 1
                _this.loadItemList()
            })
            this.$on('results', results => {
                this.results = results
            })
        },
        mounted() {
            let _this = this
            _this.loadItemList()
            _this.seacher = new FuzzySearch(_this.itemList, ['title', 'context'], {
                caseSensitive: false,
                sort: true
            })
            _this.keywords = document.querySelector('.input-search').value
            if (_this.keywords) {
                // 加载搜索结果
                _this.loadItemList()
            }
        },
        methods: {
            loadItemList() {
                let _this = this
                let start = _this.pageSize * (_this.pageCurrent - 1)
                let end = _this.pageSize * _this.pageCurrent
                let searchInfo = {}
                if (_this.keywords) {
                    console.log('search', _this.itemList, _this.keywords)
                    let results = _this.seacher.search(_this.keywords)
                    _this.pageCount = results.length
                    _this.results = results.slice(start, end)
                } else {
                    if (_this.categoryId === _this.Constants.ID.favouriteId) {
                        searchInfo.favourite = true
                    } else if (_this.categoryId === _this.Constants.ID.defaultCategoryId) {
                    } else {
                        searchInfo.categoryId = _this.categoryId
                    }
                    let collections = _this.$db.get('notes')
                    _this.itemList = collections.value()
                    collections = collections.filter(searchInfo)
                    _this.pageCount = collections.size().value()
                    _this.results = collections.sortBy('time').slice(start, end).cloneDeep().value().reverse()
                }
            },
            editNote(id) {
                this.$router.push({name: 'edit', query: {id: id, categoryId: this.categoryId}})
            },
            deleteNote(note) {
                let _this = this
                let recycle = note.categoryId === _this.Constants.ID.recycleId
                let info = (recycle ? '删除后将无法恢复，' : '') + '确定删除此笔记吗？'
                _this.$confirm(info, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    _this.$db.get('notes').remove({id: note.id}).write()
                    _this.loadItemList()
                    if (recycle) {
                        return
                    }
                    // 转移当前分类下内容到回收站
                    note.categoryId = _this.Constants.ID.recycleId
                    _this.$db.get('notes').insert(note).write()
                }).catch(() => {
                })
            },
            favouriteNote(note) {
                let _this = this
                _this.$db.get('notes').find({id: note.id}).assign({favourite: !note.favourite}).write()
                _this.loadItemList()
            },
            copyNoteTitle(title) {
                Clipboard.copyToClipboard(title).then(() => {
                    this.$message.success('已复制标题')
                })
            },
            pageCurrentChangeHandler(pageCurrent) {
                let _this = this
                _this.pageCurrent = pageCurrent
            }
        }
    }
</script>

<style scoped lang="scss">

    .list {
        margin-bottom: 100px;
    }

    .list-ul {
        list-style: none;
        padding: 0;
        margin: 0;
        background-color: #FFFFFF;
    }

    .list-ul li {
        color: #494949;
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #EFEFEF;
        background-color: #FDFDFD;
    }

    .list .item-title-group {
        cursor: pointer;
        display: inline-block;
        width: 70%;
        float: left;
    }

    .list .item-title-group .item-title {
        padding-left: 10px;
    }

    .btn-edit {
        opacity: 0.3;
        position: fixed;
        bottom: 40px;
        right: 40px;
    }

    .btn-edit:hover {
        opacity: 1;
    }

    .item-btn-group {
        display: inline-block;
        width: 30%;
        text-align: right;
    }

    .btn-del {
        cursor: pointer;
        margin-left: 8px;
        margin-right: 16px;
    }

    .btn-favourite {
        cursor: pointer;
        margin: 0 8px;
    }

    .no-data {
        font-weight: bold;
        font-size: 28px;
        color: #CDCDCD;
        text-align: center;
        padding-top: 8%;
    }
</style>
