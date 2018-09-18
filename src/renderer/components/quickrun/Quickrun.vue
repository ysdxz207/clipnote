<template>
    <ul class="quickrun-ul">
        <li v-for="(shortcut, index) in shortcutList"
            :key="index" @mousedown="shortcutMouseDown($event, shortcut)"
            :title="shortcut.name">
            <img :src="shortcut.icon" height="18"/>{{shortcut.name}}
        </li>
    </ul>
</template>

<script>
    import electron from 'electron'
    import fs from 'fs'
    import EIconExtractor from '../../utils/EIconExtractor'
    const windowsShortcuts = require('windows-shortcuts')
    const filter = require('lodash.filter')
    const childProcess = require('child_process')
    const dialog = electron.remote.dialog
    const BrowserWindow = electron.remote.BrowserWindow
    const path = require('path')
    const url = require('url')

    export default {
        data() {
            return {
                type: 'shortcut',
                shortcutList: []
            }
        },
        mounted() {
            let _this = this
            // 阻止浏览器默认行为
            document.addEventListener('drop', function (e) {
                e.preventDefault()
            })
            document.addEventListener('dragleave', function (e) {
                e.preventDefault()
            })
            document.addEventListener('dragenter', function (e) {
                e.preventDefault()
            })
            document.addEventListener('dragover', function (e) {
                e.preventDefault()
            })
            document.addEventListener('drop', _this.onDropFiles)

            _this.$db.find({
                type: _this.type
            }).sort({
                id: -1
            }).exec((err, docs) => {
                if (!err) {
                    _this.shortcutList = docs
                }
            })
        },
        methods: {
            checkEShortcutExists(name) {
                let result = filter(this.shortcutList, x => x.name === name)
                if (result.length > 0) {
                    return true
                }
                return false
            },
            run(eshortcut) {
                if (eshortcut == null) {
                    dialog.showErrorBox('错误', '运行异常：传入的快捷方式为空!')
                    return
                }
                // 关闭窗口
                electron.remote.getCurrentWindow().hide()
                let path = eshortcut.path
                if (!fs.existsSync(path)) {
                    path = eshortcut.target
                }
                path = eshortcut.args ? path + ' ' + eshortcut.args : path
                childProcess.exec('start ' + path, function (err, data) {
                    if (err) {
                        dialog.showErrorBox('错误', '运行[' + eshortcut.name + ']失败了：' + err)
                    }
                    // console.log(data.toString())
                })
            },
            onDropFiles(e) {
                let _this = this
                let fileList = e.dataTransfer.files

                let list = []

                for (var i = 0; i < fileList.length; i++) {
                    let eshortcut = {}
                    let file = fileList[i]
                    let name = file.name
                    let path = file.path

                    // 检查是否已存在
                    if (_this.checkEShortcutExists(name)) {
                        return
                    }

                    eshortcut.type = _this.type
                    eshortcut.id = process.hrtime().join('')

                    windowsShortcuts.query(path, function (a, o) {
                        let args = o.args
                        let desc = o.desc
                        let hotkey = o.hotkey
                        let icon = o.icon
                        let target = o.target
                        let workingDir = o.workingDir

                        eshortcut.name = name
                        eshortcut.path = path
                        eshortcut.target = target
                        eshortcut.icon = icon
                        eshortcut.args = args
                        eshortcut.hotkey = hotkey
                        eshortcut.workingDir = workingDir
                        eshortcut.desc = desc

                        // window-shortcut无法获取到icon，使用工具获取
                        EIconExtractor.getIcon(name, path, (data) => {
                            let icon = data.Base64ImageData
                            if (icon) {
                                eshortcut.icon = 'data:image/png;base64,' + icon
                            }
                            list.push(eshortcut)

                            // 保存数据库
                            _this.$db.insert(eshortcut, (err, newDoc) => {
                                if (!err) {
                                    console.log(newDoc)
                                }
                            })
                        })
                    })
                }
            },
            showEditDialog(eshortcut) {
                let editWindow = new BrowserWindow({
                    id: 'window_edit_eshortcut',
                    parent: electron.remote.getCurrentWindow(),
                    modal: true,
                    resizable: false,
                    width: 562,
                    height: 272,
                    // width: 900,
                    // height: 600,
                    webPreferences: {

                        devTools: false
                    }
                })

                editWindow.setMenu(null)

                editWindow.loadURL(url.format({
                    pathname: path.join(__dirname, '/app/edit.html'),
                    protocol: 'file:',
                    slashes: true
                }))

                editWindow.webContents.on('did-finish-load', () => {
                    editWindow.webContents.send('eshortcut', eshortcut)
                })
                editWindow.show()

                editWindow.webContents.openDevTools()
            },
            setSelected(index) {
                let selectedList = document.querySelectorAll('.quickrun-ul li')

                for (let i = 0; i < selectedList.length; i++) {
                    selectedList[i].classList.remove('selected')
                }
                if (index !== -1) {
                    selectedList[index].classList.add('selected')
                }
            },
            shortcutMouseDown(e, shortcut) {
                let _this = this
                if (e.button === 0) {
                    _this.run(shortcut)
                } else if (e.button === 2) {
                    _this.showEditDialog(shortcut)
                }
            }

        }
    }
</script>

<style scoped>
    ul {
        list-style: none;
        padding: 0;
        /*禁止浏览器选择文本,防止双击选中文本*/
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    li {
        height: 24px;
        line-height: 24px;
        border-bottom: 1px solid #DDDDDD;
        list-style: none;
        cursor: pointer;
        padding-left: 2px;
        overflow: hidden;
        -ms-text-overflow: ellipsis;/*省略号*/
        text-overflow: ellipsis;/*省略号*/
        display:block;
        font-size:18px;
        white-space:nowrap;/*强制不换行*/
    }

    li:hover {
        background-color: aqua;
    }

</style>
