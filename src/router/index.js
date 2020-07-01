import Vue from 'vue'
import VueRouter from 'vue-router'
// 导入路由组件
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  // 重定向
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

const router = new VueRouter({
  routes
})

export default router
