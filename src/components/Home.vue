<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <!-- logo区域 -->
      <div>
        <img src="../assets/heima.png" alt />
        <span>电商管理平台后台管理系统</span>
      </div>
      <!-- 退出按钮 -->
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened
          :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id +''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <i :class="icons[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id"
              @click="saveNavPath('/'+subItem.path)">
              <!-- 二级菜单模板 -->
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 菜单数据
      menuList: [],
      // 字体图标
      icons: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    // 组件创建后发送请求，获取菜单信息
    this.getMenuList()
    // 获取动态路径
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  mounted() {
    // 监听路由地址的变化,并存储到sessionStorage中
    window.addEventListener('hashchange', () => {
      window.sessionStorage.setItem('activePath', this.$route.path)
      this.activePath = this.$route.path
    })
  },
  methods: {
    logout() {
      // 清空token
      window.sessionStorage.clear()
      // 重定向到login页面
      this.$router.push('/login')
    },
    // 获取菜单信息
    async getMenuList() {
      const res = await this.$http.get('menus')
      if (res.data.meta.status !== 200) return this.$message.error(res.data.meta.message)
      this.menuList = res.data.data
    },
    // 折叠菜单
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存动态路径
    saveNavPath(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    > img {
      height: 50px;
      width: 50px;
    }
    > span {
      margin: 0 10px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  color: #fff;
  font-size: 12px;
  text-align: center;
  line-height: 25px;
  background-color: #4a5064;
  cursor: pointer;
  letter-spacing: 0.2em;
}
</style>
