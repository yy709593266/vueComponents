import Vue from 'vue'
import Router from 'vue-router'

import exchangeSelect from './views/exchangeSelect/index.vue'

Vue.use(Router)

// 左侧边栏导航页面
export const appRouter = [
  {
    path: '/',
    name: 'exchangeSelect',
    component: exchangeSelect
  }
]

const allRouters = new Router({
  mode: 'history',
  routes: [
    ...appRouter
  ]
})

export default allRouters
