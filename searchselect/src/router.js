import Vue from 'vue'
import Router from 'vue-router'

import searchSelect from './views/searchSelect/searchSelect.vue'

Vue.use(Router)

// 左侧边栏导航页面
export const appRouter = [
  {
    path: '/',
    name: 'searchSelect',
    component: searchSelect
  }
]

const allRouters = new Router({
  mode: 'history',
  routes: [
    ...appRouter
  ]
})

export default allRouters
