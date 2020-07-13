import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
// import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
// 导入全局的时间过滤器
import './assets/js/dateFormat'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入相应样式
// import 'quill/dist/quill.core.css' // import styles
// import 'quill/dist/quill.snow.css' // for snow theme
// import 'quill/dist/quill.bubble.css' // for bubble theme
// 导入NProgress
import Nprogress from 'nprogress'
// import 'nprogress/nprogress.css'
// 配置axios
Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
// 请求拦截器,设置token令牌
axios.interceptors.request.use(config => {
  // 在请求拦截器中启用nprogress
  Nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 配置响应拦截器
axios.interceptors.response.use(config => {
  // 关闭nprogress
  Nprogress.done()
  return config
})

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
