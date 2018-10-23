<template>
    <div class="quickrun-main">
        <ul class="quickrun-ul">
            <li v-for="(shortcut, index) in shortcutList"
                :key="index" @mousedown="shortcutMouseDown($event, shortcut)"
                :title="shortcut.name">
                <img :src="shortcut.icon" height="18"/>{{shortcut.name}}
            </li>
        </ul>
        <canvas id="canvas_background_quickrun"></canvas>
    </div>
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
            this.setCanvasBackground()
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
            scrollFollow(index, direction) {
                let _this = this
                let el = document.querySelector('.quickrun-ul')
                let elLi = el.querySelector('li.selected')
                let elLiArr = el.querySelectorAll('li')
                let liHeight = elLi.offsetHeight
                let scrollTop = el.scrollTop
                let changedScrollTop = scrollTop
                if (direction > 0) {
                    // 向上
                    if (elLi.offsetTop <= scrollTop + elLi.offsetHeight) {
                        changedScrollTop = (scrollTop - liHeight) < 0 ? 0 : scrollTop - liHeight
                    }
                } else {
                    // 向下
                    if (elLi.offsetTop + liHeight >= el.offsetHeight) {
                        changedScrollTop = scrollTop + liHeight
                    }
                }
                // 末尾
                if (direction < 0 && index === 0) {
                    changedScrollTop = 0
                    // 选中第一个
                    _this.setSelected(0)
                }
                // 第一个
                if (direction > 0 && index === elLiArr.length - 1) {
                    // 选中最后一个
                    _this.setSelected(elLiArr.length - 1)
                    el.scrollTo(0, el.clientHeight)
                }
                el.scrollTop = changedScrollTop
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
                    _this.scrollFollow(index - 1, 1)
                    break

                case 40:
                    // 屏蔽下方向键
                    e.preventDefault()
                    if (index === liList.length - 1) {
                        index = -1
                    }
                    _this.setSelected(index + 1)
                    _this.scrollFollow(index + 1, -1)
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
            },
            setCanvasBackground() {
                let canvas = document.querySelector('#canvas_background_quickrun')
                let context = canvas.getContext('2d')

                canvas.width = window.innerWidth
                canvas.height = window.innerHeight

                let img = new Image()
                img.src = require('../../../../static/assets/images/bg_main.jpg')
                img.onload = drawImg

                function drawImg() {
                    context.drawImage(img, 340, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
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
        /*background-color: #e0ffdc;*/
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
        font-size: 18px;
        white-space: nowrap; /*强制不换行*/
    }

    li.selected {
        background-color: #00d36d;
    }

    li:hover {
        background-color: #25f7ff;
    }

    #canvas_background_quickrun {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        pointer-events: none;
        opacity: 0.32;
        filter: contrast(66%);
    }

    .quickrun-main {
        position: absolute;
        top: 30px;
        left: 0;
        bottom: 0;
        width: 99.9%
    }

    .quickrun-ul {
        height: 100%;
        overflow: scroll;
    }

</style>
