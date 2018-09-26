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
    import Constants from '../../utils/Constants'

    let windowManager = electron.remote.require('electron-window-manager')

    const windowsShortcuts = require('windows-shortcuts')
    const childProcess = require('child_process')
    const dialog = electron.remote.dialog

    export default {
        data() {
            return {
                shortcutList: [],
                editWindow: null
            }
        },
        created() {
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
            document.removeEventListener('drop', _this.onDropFiles)
            document.addEventListener('drop', _this.onDropFiles)
            document.removeEventListener('keydown', _this.onKeydown)
            document.addEventListener('keydown', _this.onKeydown)

            // 加载列表
            _this.loadQuickrunList()
            // 创建编辑窗口
            _this.createEditWindow()
            // 修改快捷方式，放在quickrunEdit里会数据不同步
            electron.remote.ipcMain.on('shortcutEdit', (event, o) => {
                console.log('edit:', o)
                _this.$db.get('shortcuts').find({
                    id: o.id
                }).assign(o).write()
                _this.loadQuickrunList()
            })
            // 删除快捷方式，放在quickrunEdit里会数据不同步
            electron.remote.ipcMain.on('shortcutDelete', (event, o) => {
                console.log('delete:', o)
                _this.$db.get('shortcuts').remove({id: o.id}).write()
                _this.loadQuickrunList()
            })
        },
        methods: {
            createEditWindow() {
                let _this = this
                let editWindow = windowManager.get(_this.Constants.NAME.QUICKRUN_EDIT).object
                if (editWindow) {
                    _this.editWindow = editWindow
                    return
                }
                editWindow = windowManager.createNew(_this.Constants.NAME.QUICKRUN_EDIT, '', Constants.URL.index + '#/quickrun/edit', false, {
                    show: false,
                    frame: false,
                    parent: electron.remote.getCurrentWindow(),
                    modal: true,
                    resizable: false,
                    width: process.env.DEBUG === 'yes' ? 1000 : 520,
                    height: 320
                }).create().object

                if (process.env.DEBUG === 'yes') {
                    editWindow.webContents.openDevTools()
                }

                editWindow.on('close', (e) => {
                    e.preventDefault()
                    editWindow.hide()
                })

                _this.editWindow = editWindow
            },
            loadQuickrunList() {
                let _this = this
                _this.shortcutList = _this.$db.get('shortcuts').sortBy('time').value()
            },
            checkEShortcutExists(name) {
                let result = this.shortcutList.filter(x => x.name === name)
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
                path = '"" "' + path + '"'
                path = eshortcut.args ? path + ' ' + eshortcut.args : path
                console.log(eshortcut)
                childProcess.exec('start ' + path, {
                    cwd: eshortcut.workingDir,
                    windowsHide: true
                }, function (err, data) {
                    if (err) {
                        // dialog.showErrorBox('错误', '运行[' + eshortcut.name + ']失败了：' + err)
                    }
                    // console.log(data.toString())
                })
            },
            onDropFiles(e) {
                let _this = this
                let fileList = e.dataTransfer.files

                for (let i = 0; i < fileList.length; i++) {
                    let eshortcut = {}
                    let file = fileList[i]
                    let name = file.name
                    let path = file.path
                    if (name.lastIndexOf('.') > 0) {
                        name = name.substring(0, name.lastIndexOf('.'))
                    }

                    // 检查是否已存在
                    if (_this.checkEShortcutExists(name)) {
                        return
                    }

                    eshortcut.type = _this.type
                    eshortcut.id = process.hrtime().join('')

                    windowsShortcuts.query(path, function (a, o) {
                        path = path && path.replace(/\\/gim, '/')
                        let args = o.args
                        let desc = o.desc
                        let hotkey = o.hotkey
                        let icon = o.icon
                        let target = o.target
                        let workingDir = o.workingDir && o.workingDir.replace(/\\/gim, '/')
                        if (!workingDir) {
                            workingDir = path.substring(0, path.lastIndexOf('/'))
                        }
                        eshortcut.name = name
                        eshortcut.path = path
                        eshortcut.target = target && target.replace(/\\/gim, '/')
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

                            // 保存数据库
                            _this.$db.get('shortcuts').insert(eshortcut).write()
                            _this.loadQuickrunList()
                        })
                    })
                }
            },
            showEditDialog(shortcut) {
                let _this = this
                _this.editWindow.webContents.send('shortcut', shortcut)
                _this.editWindow.show()
                console.log('edit:' + shortcut.id)
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
            },
            delete(shortcut) {
                electron.remote.dialog.showMessageBox(electron.remote.getCurrentWindow(), {
                    type: 'error',
                    title: '提示',
                    message: '确定删除此快捷方式吗？',
                    buttons: ['确定', '取消'],
                    cancelId: -1,
                    defaultId: 1
                }, (index) => {
                    if (index === 0) {
                        electron.ipcRenderer.send('shortcutDelete', shortcut)
                    }
                })
            },
            onKeydown(e) {
                let _this = this
                let mainul = document.querySelector('.quickrun-ul')
                let selected = mainul.querySelector('li.selected')
                let liList = mainul.querySelectorAll('li')

                let index = selected == null ? -1 : [].indexOf.call(liList, selected)

                switch (e.which) {
                case 38:
                    // 屏蔽上向键
                    e.preventDefault()

                    if (index === 0) {
                        index = liList.length
                    }
                    _this.setSelected(index - 1)
                    break

                case 40:
                    // 屏蔽下方向键
                    e.preventDefault()
                    if (index === liList.length - 1) {
                        index = -1
                    }
                    _this.setSelected(index + 1)
                    break

                    // ESC
                case 27:
                    _this.setSelected(-1)
                    break
                case 13:
                    // 回车
                    /* falls through */
                case 32:
                    // 空格
                    e.preventDefault()
                    if (index > -1 && index < liList.length) {
                        _this.run(_this.shortcutList[index])
                    }
                    break
                case 46:
                    // 删除
                    if (index > -1 && index < liList.length) {
                        _this.delete(_this.shortcutList[index])
                    }
                }
            }
        }
    }
</script>

<style scoped>
    ul {
        margin: 0;
        padding: 0;
        height: 100vh;
        background-color: #e0ffdc;
        list-style: none;
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
        /*border-bottom: 1px solid #F2F2F2;*/
        list-style: none;
        cursor: pointer;
        padding-left: 2px;
        overflow: hidden;
        -ms-text-overflow: ellipsis; /*省略号*/
        text-overflow: ellipsis; /*省略号*/
        font-size: 18px;
        white-space: nowrap; /*强制不换行*/
    }

    li.selected {
        background-color: #47e2ff;
    }

    li:hover {
        background-color: #a2f2ff;
    }

</style>
