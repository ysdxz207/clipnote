<template>
    <div>
        <ul>
            <li v-for="(item, index) in itemList" :key="index">
                {{item.title}}
            </li>
        </ul>
        <el-button class="btn-edit"
                   type="success"
                   icon="el-icon-edit"
                   circle
                   @click.native="editNote"></el-button>
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
            '$route' (to, from) {
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
            editNote() {
                this.$router.push({name: 'edit', query: {categoryId: this.categoryId}})
            }
        }
    }
</script>

<style>

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
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
</style>
