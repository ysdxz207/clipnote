import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App'
import router from './router'
import store from './store'
import db from './db'
import './assets/icons/iconfont.css'
import './assets/icons/iconfont.js'
const clipboard = require('electron-clipboard-extended')

Vue.use(ElementUI)

Vue.prototype.bus = new Vue()
Vue.prototype.$db = db
Vue.prototype.clipboard = clipboard

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    components: {App},
    router,
    store,
    template: '<App/>'
}).$mount('#app')
