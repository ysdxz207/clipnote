import Vue from 'vue'
import Router from 'vue-router'

import Index from '@/components/LandingPage'
import List from '@/components/List'
import Edit from '@/components/Edit'
import Setting from '@/components/Setting'
import Quickrun from '@/components/quickrun/Quickrun'
import QuickrunEdit from '@/components/quickrun/QuickrunEdit'
import JsonFormatter from '@/components/JsonFormatter'

Vue.use(Router)

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
            path: '/setting',
            name: 'setting',
            component: Setting
        },
        {
            path: '/quickrun',
            name: 'quickrun',
            component: Quickrun
        },
        {
            path: '/quickrun/edit',
            name: 'quickrunEdit',
            component: QuickrunEdit
        },
        {
            path: '/jf',
            name: 'jsonFormatter',
            component: JsonFormatter
        }
    ]
})
