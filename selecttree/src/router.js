import Vue from 'vue'
import Router from 'vue-router'

import selectTree from './views/selectTree/selectTree.vue'

Vue.use(Router)

// 左侧边栏导航页面
export const appRouter = [
  {
    path: '/',
    name: 'selectTree',
    component: selectTree
  }
]

const allRouters = new Router({
  mode: 'history',
  routes: [
    ...appRouter
  ]
})

export default allRouters
