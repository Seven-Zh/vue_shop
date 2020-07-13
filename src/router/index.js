import Vue from 'vue'
import VueRouter from 'vue-router'
// 导入路由组件,路由懒加载
// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome.vue')
// import Users from '../components/User/Users.vue'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/User/Users.vue')
// import Rights from '../components/Power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/Power/Rights.vue')
// import Roles from '../components/Power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/Power/Roles.vue')
// import Cate from '../components/Goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/Goods/Cate.vue')
// import Params from '../components/Goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/Goods/Params.vue')
// import List from '../components/Goods/List.vue'
const List = () => import(/* webpackChunkName: "List_Add_Edit" */ '../components/Goods/List.vue')
// import Add from '../components/Goods/Add.vue'
const Add = () => import(/* webpackChunkName: "List_Add_Edit" */ '../components/Goods/Add.vue')
// import Edit from '../components/Goods/Edit.vue'
const Edit = () => import(/* webpackChunkName: "List_Add_Edit" */ '../components/Goods/Edit.vue')
// import Order from '../components/Order/Order.vue'
const Order = () => import(/* webpackChunkName: "Order_Reprot" */ '../components/Order/Order.vue')
// import Reprot from '../components/Report/Report.vue'
const Reprot = () => import(/* webpackChunkName: "Order_Reprot" */ '../components/Report/Report.vue')

Vue.use(VueRouter)

const routes = [
  // 重定向
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/goods/edit/:id', component: Edit },
      { path: '/orders', component: Order },
      { path: '/reports', component: Reprot }
    ]
  }
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
