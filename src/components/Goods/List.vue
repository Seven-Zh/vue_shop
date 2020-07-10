<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索框 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList"
            @change="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="90px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
        <el-table-column label="创建时间" width="140px">
          <template v-slot="slotProps">
            {{slotProps.row.add_time | format('yyyy-MM-dd hh:mm:ss')}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="slotProps">
            <el-button size="mini" type="primary" class="el-icon-edit" @click="goEditPage(slotProps.row.goods_id)">编辑
            </el-button>
            <el-button size="mini" type="danger" class="el-icon-delete" @click="removeGoodById(slotProps.row.goods_id)">
              删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[10, 20, 30, 40]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取商品列表的请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品总数
      total: 0,
      // 商品列表
      goodsList: []
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 发送请求获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      // 失败
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      // 成功
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 监听pagesize变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // 重新渲染数据
      this.getGoodsList()
    },
    // 监听pagenum变化
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      // 重新渲染数据
      this.getGoodsList()
    },
    // 删除商品功能
    async removeGoodById(id) {
      // 弹窗
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消删除成功')
      // 用户确认删除，发送请求
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除商品成功')
      // 重新渲染数据
      this.getGoodsList()
    },
    // 去往添加商品页面
    goAddPage() {
      this.$router.push('/goods/add')
    },
    // 去往编辑商品页面
    goEditPage(id) {
      this.$router.push('/goods/edit/' + id)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
