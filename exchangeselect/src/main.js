// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Hui from 'hui'
import 'hui/lib/theme-default/index.css'
import router from './router.js'
import store from './store'
import axios from 'axios'
import overflow from '@/components/overflow/overflow.vue'

Vue.use(Hui)
Vue.component('overflow', overflow)
Vue.config.productionTip = false

// 拦截请求结果并过滤
axios.interceptors.response.use(function (res) {
  return res.data
})

/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#myapp')
