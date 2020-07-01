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

// 设置路由导航守卫
router.beforeEach((to, from, next) => {
  // to要去哪儿
  // from从哪儿来
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
