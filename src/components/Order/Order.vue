<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @change="getOrderList"
            @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 数据列表 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款">
          <template v-slot="slotProps">
            <el-tag v-if="slotProps.row.pay_status===1" type="success">已付款</el-tag>
            <el-tag v-else type="warning">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间">
          <template v-slot="slotProps">{{slotProps.row.create_time | format('yyyy-MM-dd hh:mm:ss')}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="slotProps">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditOrderDialog(slotProps.row)">
            </el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showLocation(slotProps.row)">
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 20, 30]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

      <!-- 修改订单信息对话框 -->
      <el-dialog title="修改订单地址" :visible.sync="editOrderDialogVisible" width="50%">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="adressInfo1">
            <!-- 级联选择器渲染省市区联动 -->
            <el-cascader v-model="editForm.adressInfo1" :options="cityData" :props="{ expandTrigger: 'hover' }"
              class="cascader">
            </el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="adressInfo2">
            <el-input v-model="editForm.adressInfo2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editOrderDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editOrderDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 展示物流信息对话框 -->
      <el-dialog title="物流信息" :visible.sync="locationDialogVisible" width="50%">
        <el-timeline>
          <el-timeline-item v-for="(item, index) in locationInfo" :key="index" :timestamp="item.time">
            {{item.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from '../../assets/js/citydata'

export default {
  data() {
    return {
      // 请求参数
      queryInfo: {
        query: '',
        pagesize: 10,
        pagenum: 1
      },
      // 总页数
      total: 0,
      // 订单列表
      orderList: [],
      // 控制展示物流信息对话框显示隐藏
      locationDialogVisible: false,
      // 控制修改订单信息对话框显示隐藏
      editOrderDialogVisible: false,
      // 物流信息
      locationInfo: [],
      // 城市信息
      cityData,
      // 修改地址表单
      editForm: {
        adressInfo1: [],
        adressInfo2: ''
      },
      // 修改地址表单验证规则
      editFormRules: {
        adressInfo1: [{ required: true, message: '请选择地区', trigger: 'blur' }],
        adressInfo2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单信息
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      // 失败
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败')
      // 成功存储数据到data中
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 监听pagesize
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听pagenum
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    // 展示物流信息
    async showLocation() {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      if (res.meta.status !== 200) return this.$message.error('获取物流信息失败')
      this.locationInfo = res.data
      this.locationDialogVisible = true
    },
    // 显示并渲染修改地址对话框
    showEditOrderDialog() {
      this.editOrderDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.cascader {
  width: 100%;
}
</style>
