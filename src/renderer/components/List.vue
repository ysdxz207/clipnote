<template>
    <div class="list">
        <el-checkbox-group v-if="results.length > 0" v-model="checkedNotes" @change="handleCheckedNotesChange">
            <ul class="list-ul">
                <li v-for="item in results"
                    :key="item.id">
                    <span class="item-title-group">
                        <el-checkbox :label="item.id">
                            <span class="item-title">{{item.title.length > 20 ? (item.title.substring(0, 20) + '...') : item.title}}</span>
                        </el-checkbox>
                    </span>
                    <span class="item-btn-group">
                        <span class="btn-list-operation" title="编辑" @click="editNote(item.id)">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#clipnote-icon-edit"></use>
                            </svg>
                        </span>
                        <span class="btn-list-operation" title="复制标题" @click="copyNoteTitle(item.title)">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#clipnote-icon-copy"></use>
                            </svg>
                        </span>
                        <span class="btn-list-operation" v-if="item.state !== Constants.STATE.recycle" title="添加/取消收藏" @click="favouriteNote(item)">
                            <i class="element-icons clipnote-icon-favourite"
                               :style="item.state === Constants.STATE.favourite ? 'color: yellow' : 'color: grey'"></i>
                        </span>
                        <span class="btn-list-operation" v-if="item.state === Constants.STATE.recycle" :title="item.categoryId ? '恢复笔记' : '粘贴板笔记无法恢复'" @click="revertNote(item)">
                            <svg class="icon" aria-hidden="true" v-if="item.categoryId">
                                <use xlink:href="#clipnote-icon-revert"></use>
                            </svg>
                            <svg class="icon" aria-hidden="true" v-else>
                                <use xlink:href="#clipnote-icon-unrevert"></use>
                            </svg>
                        </span>
                        <span class="btn-del" title="删除笔记" @click="deleteNote(item)">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#clipnote-icon-delete"></use>
                            </svg>
                        </span>
                    </span>
                </li>
            </ul>
        </el-checkbox-group>
        <div v-else class="no-data">
            这里啥也没有
        </div>
        <div style="margin-top: 30px;text-align: center">
            <el-pagination
                    v-if="total > pageSize"
                    :page-size="pageSize"
                    layout="prev, pager, next"
                    :total="total"
                    @current-change="pageCurrentChangeHandler">
            </el-pagination>
        </div>
        <el-button class="btn-edit"
                   type="success"
                   icon="el-icon-edit"
                   circle
                   @click.native="editNote()"
                   title="写笔记"
                   v-if="$route.query.categoryId && $route.query.categoryId !== Constants.ID.defaultCategoryId"></el-button>
        <el-button class="btn-delete-batch"
                   type="danger"
                   icon="el-icon-delete"
                   circle
                   @click.native="deleteNoteBatch()"
                   v-show="checkedNotes.length > 0"
                   title="批量删除"></el-button>
    </div>
</template>

<script>
    import FuzzySearch from 'fuzzy-search'
    import Clipboard from '../utils/Clipboard'
    const Mousetrap = require('mousetrap')
    export default {
        data() {
            return {
                categoryId: this.$route.query.categoryId || null,
                state: this.$route.query.state || null,
                itemList: [],
                results: [],
                pageSize: 20,
                pageCurrent: 1,
                total: 0,
                keywords: '',
                searcher: null,
                checkedAllNotes: false,
                checkedNotes: []
            }
        },
        watch: {
            '$route'(to, from) {
                this.state = this.$route.query.state || null
                this.categoryId = this.$route.query.categoryId || null
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
            // 绑定全选快捷键
            Mousetrap.bind(['command+a', 'ctrl+a'], () => {
                _this.selectAll()
                // 返回 false 以防止默认行为，并阻止事件冒泡
                return false
            })
            // 绑定删除键
            Mousetrap.bind(['del'], () => {
                _this.deleteNoteBatch()
                // 返回 false 以防止默认行为，并阻止事件冒泡
                return false
            })
        },
        methods: {
            loadItemList() {
                let _this = this
                // 重置选中
                _this.checkedNotes = []
                let start = _this.pageSize * (_this.pageCurrent - 1)
                let end = _this.pageSize * _this.pageCurrent
                // 查询所有数据
                let collections = _this.$db.get('notes')
                _this.itemList = collections.sortBy('time').cloneDeep().value().reverse()

                let results = _this.itemList
                if (_this.keywords) {
                    results = _this.seacher.search(_this.keywords)
                }
                results = results.filter(o => {
                    if (_this.categoryId !== null) {
                        if (_this.categoryId === _this.Constants.ID.defaultCategoryId) {
                            return o.state !== _this.Constants.STATE.recycle
                        }
                        return o.categoryId === _this.categoryId && o.state !== _this.Constants.STATE.recycle
                    } else {
                        return o.state === _this.state
                    }
                })
                _this.total = results.length
                _this.results = results.slice(start, end)
            },
            editNote(id) {
                this.$router.push({name: 'edit', query: {id: id, categoryId: this.categoryId, state: this.state}})
            },
            deleteNote(note) {
                let _this = this
                let recycle = note.state === _this.Constants.STATE.recycle
                let info = (recycle ? '删除后将无法恢复，' : '') + '确定删除此笔记吗？'
                _this.$confirm(info, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let collections = _this.$db.get('notes')
                    if (recycle) {
                        collections.remove({id: note.id}).write()
                    } else {
                        // 转移当前分类下内容到回收站
                        note.state = _this.Constants.STATE.recycle
                        collections.find({id: note.id}).assign(note).write()
                    }
                    _this.loadItemList()
                }).catch(() => {
                })
            },
            favouriteNote(note) {
                let _this = this
                let state = note.state === _this.Constants.STATE.favourite ? _this.Constants.STATE.available : _this.Constants.STATE.favourite
                _this.$db.get('notes').find({id: note.id}).assign({state: state}).write()
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
            },
            deleteNoteBatch() {
                let _this = this
                if (_this.checkedNotes.length === 0) {
                    return
                }
                let collections = _this.$db.get('notes')
                _this.$confirm('确定删笔记吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    _this.checkedNotes.forEach((id) => {
                        if (_this.state === _this.Constants.STATE.recycle) {
                            collections.remove({id: id}).write()
                        } else {
                            // 转移当前分类下内容到回收站
                            let note = collections.find({id: id}).cloneDeep().value()
                            note.state = _this.Constants.STATE.recycle
                            collections.assign(note).write()
                        }
                        _this.loadItemList()
                    })
                }).catch(() => {
                })
            },
            selectAll() {
                this.checkedNotes = this.results.map((o) => o.id)
            },
            handleCheckedNotesChange(value) {
                // 勾选后focus
                document.querySelector('.list').focus()
            },
            revertNote(item) {
                let _this = this
                if (!item.categoryId) {
                    return
                }
                _this.$confirm('确定还原笔记吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 查询笔记的分类是否被删除
                    if (!item.categoryId && _this.$db.get('categories').find({id: item.categoryId}).value()) {
                        _this.$alert('当前笔记所属分类已被删除，无法恢复。', '提示')
                        return
                    }
                    _this.$db.get('notes').find({id: item.id}).assign({state: _this.Constants.STATE.available}).write()
                    _this.loadItemList()
                }).catch(() => {
                })
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
        display: inline-block;
        width: 60%;
        float: left;
    }

    .list .item-title-group .item-title {
        padding-left: 2px;
    }

    .el-checkbox {
        margin-left: 8px;
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
        width: 40%;
        text-align: right;
        font-size: 20px;
    }

    .btn-del {
        cursor: pointer;
        margin-left: 8px;
        margin-right: 16px;
    }

    .btn-list-operation {
        cursor: pointer;
        margin: 0 8px;
    }

    .btn-list-operation .element-icons {
        font-size: 20px;
    }

    .no-data {
        font-weight: bold;
        font-size: 28px;
        color: #CDCDCD;
        text-align: center;
        padding-top: 8%;
    }

    .btn-delete-batch {
        opacity: 0.3;
        position: fixed;
        top: 80px;
        right: 180px;
    }
    svg {
        width: 20px;
        height: 20px;
    }
</style>
