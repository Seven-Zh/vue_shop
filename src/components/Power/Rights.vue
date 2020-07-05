<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" width="200px">
          <template v-slot="slotProps">
            <el-tag v-if="slotProps.row.level ==='0'">等级一</el-tag>
            <el-tag type="success" v-else-if="slotProps.row.level==='1'">等级二</el-tag>
            <el-tag type="danger" v-else>等级三</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有权限列表
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    // 获取所有权限列表
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      // 获取列表成功，赋值给rightsList
      this.rightsList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
</style>
