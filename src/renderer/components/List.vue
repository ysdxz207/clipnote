<template>
    <div class="list">
        <ul v-if="itemList.length > 0">
            <li v-for="(item, index) in itemList"
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
    import Clipboard from '../utils/Clipboard'

    export default {
        data() {
            return {
                categoryId: this.$route.query.categoryId || this.Constants.ID.defaultCategoryId,
                itemList: []
            }
        },
        watch: {
            '$route'(to, from) {
                this.categoryId = this.$route.query.categoryId || this.Constants.ID.defaultCategoryId
                this.loadItemList()
            }

        },
        created() {
            let _this = this
            _this.bus.$on('search', function (keywords) {
                _this.triggerSearch(keywords)
            })
        },
        mounted() {
            let _this = this
            _this.loadItemList()
        },
        methods: {
            triggerSearch(keywords) {
                let _this = this
                let keywordArr = keywords.split(' ')
                let regStr = ''
                keywordArr.forEach((o, index) => {
                    o = o.replace(/\\/g, '\\\\')
                        .replace(/\//g, '\\/')
                        .replace(/\|/g, '\\|')
                        .replace(/\{/g, '\\{')
                        .replace(/\}/g, '\\}')
                        .replace(/\(/g, '\\(')
                        .replace(/\)/g, '\\)')
                        .replace(/\[/g, '\\[')
                        .replace(/\]/g, '\\]')
                        .replace(/\^/g, '\\^')
                        .replace(/\$/g, '\\$')
                        .replace(/\+/g, '\\+')
                        .replace(/\?/g, '\\?')
                        .replace(/\./g, '\\.')
                        .replace(/\*/g, '\\*')
                    regStr += '(' + o + ')([\\s\\S]*)'
                })
                console.log(regStr)
                _this.itemList = _this.$db.get('notes').sortBy('time').value()
            },
            loadItemList() {
                let _this = this
                let searchInfo = {}
                if (_this.categoryId === _this.Constants.ID.favouriteId) {
                    searchInfo.favourite = true
                } else if (_this.categoryId === _this.Constants.ID.defaultCategoryId) {
                } else {
                    searchInfo.categoryId = _this.categoryId
                }
                _this.itemList = _this.$db.get('notes').filter(searchInfo)
                    .sortBy('time').cloneDeep().value().reverse()
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
            }
        }
    }
</script>

<style lang="scss">

    .list {
    }

    .list ul {
        list-style: none;
        padding: 0;
        margin: 0;
        background-color: #FFFFFF;
    }

    .list li {
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
