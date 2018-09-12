<template>
    <div class="list">
        <ul v-if="itemList.length > 0">
            <li v-for="(item, index) in itemList"
                :key="index">
                <span class="item-title" @click="editNote(item._id)">
                    {{item.title}}
                </span>
                <span class="btn-del" @click="deleteNote(item._id)">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#clipnote-icon-delete"></use>
                    </svg>
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
                   @click.native="editNote()"></el-button>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                categoryId: this.$route.query.categoryId,
                type: this.$route.query.type,
                itemList: []
            }
        },
        watch: {
            '$route'(to, from) {
                this.categoryId = this.$route.query.categoryId
                this.type = this.$route.query.type
                this.loadItemList()
            }

        },
        mounted() {
            let _this = this
            _this.loadItemList()
        },
        methods: {
            loadItemList() {
                let _this = this
                _this.$db.find({
                    categoryId: this.categoryId,
                    type: _this.type
                }, (err, docs) => {
                    if (err) {
                        _this.$message({
                            type: 'error',
                            message: '笔记列表加载失败：' + err
                        })
                    } else {
                        _this.itemList = docs
                    }
                })
            },
            editNote(id) {
                this.$router.push({name: 'edit', query: {id: id, categoryId: this.categoryId}})
            },
            deleteNote(id) {
                let _this = this
                _this.$confirm('确定删除此笔记吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    _this.$db.remove({_id: id}, {}, (err, numRemoved) => {
                        if (err) {
                            _this.$message({
                                type: 'error',
                                message: '删除笔记失败：' + err
                            })
                        } else {
                            _this.$message({
                                type: 'success',
                                message: '删除成功'
                            })
                        }
                    })
                }).catch(() => {
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
        line-height: 40px;
        border-bottom: 1px solid #EFEFEF;
    }

    .list .item-title {
        padding-left: 10px;
        cursor: pointer;
        display: inline-block;
        width: 70%;
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

    .btn-del {
        float: right;
        margin-right: 10px;
        cursor: pointer;
    }

    .no-data {
        font-weight: bold;
        font-size: 28px;
        color: #CDCDCD;
        text-align: center;
        padding-top: 8%;
    }
</style>
