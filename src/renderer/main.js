import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App'
import router from './router'
import store from './store'
import Constants from './utils/Constants'
import Directives from './utils/Directives'
import '../../static/assets/icons/iconfont.css'
import '../../static/assets/icons/iconfont.js'
import $db from '../renderer/utils/db'
import DateUtils from '../renderer/utils/Date'

Vue.use(ElementUI)
Vue.use(Directives)

Vue.prototype.bus = new Vue()
Vue.prototype.Constants = Constants
Vue.prototype.$db = $db

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.prototype.formatDate = DateUtils.formatDate

/* eslint-disable no-new */
new Vue({
    components: {App},
    router,
    store,
    template: '<App/>'
}).$mount('#app')
