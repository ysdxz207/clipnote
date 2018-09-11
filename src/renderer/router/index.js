import Vue from 'vue'
import Router from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import Index from '@/components/LandingPage'
import List from '@/components/List'
import Edit from '@/components/Edit'

Vue.use(Router)
Vue.use(ElementUI)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'landing-page',
            component: Index,
            children: [
                {
                    name: 'list',
                    path: '',
                    components: {
                        default: List
                    }
                },
                {
                    name: 'edit',
                    path: 'edit',
                    components: {
                        default: Edit
                    }
                }
            ]
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})
