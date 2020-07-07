<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row class="mg-bottom">
        <el-col>
          <el-button type="primary" @click="addCateDialogShow">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- tree-table数据列表区域 -->
      <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index
        index-text="#" border :show-row-hover="false">
        <!-- 是否有效插槽 -->
        <template v-slot:isok="slotProps">
          <i class="el-icon-success" v-if="slotProps.row.cat_deleted===false" style="color:skyblue"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序插槽 -->
        <template v-slot:order="slotProps">
          <el-tag size="mini" v-if="slotProps.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="slotProps.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作插槽 -->
        <template v-slot:opt="slotProps">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(slotProps.row.cat_id)">编辑
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(slotProps.row.cat_id)">删除
          </el-button>
        </template>
      </tree-table>

    </el-card>

    <!-- 分页区域 -->
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>

    <!-- 添加分类对话框 -->
    <el-dialog title="提示" :visible.sync="addCateDialogVisible" width="50%" @close="closeAddCateDialog">
      <!-- 添加分类表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- 级联选择器渲染父级分类 -->
          <!-- options属性是渲染的数据源 -->
          <!-- props属性是配置选项 -->
          <!-- 注意v-model绑定的是一个数组 -->
          <el-cascader v-model="selectedKeys" :options="parentsCateList" :props="cascaderProps" @change="handleChange"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%">
      <!-- 主体区域 -->
      <el-form :model="editCateForm" :rules="addCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- footer区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取商品分类数据列表的参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表
      cateList: [],
      // 总页数
      total: 0,
      // 控制添加分类对话框显示和隐藏
      addCateDialogVisible: false,
      // 控制编辑分类对话框显示隐藏
      editCateDialogVisible: false,
      // 设置tree-table的列的属性
      columns: [
        {
          // 列的名称
          label: '分类名称',
          // 列的值
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 类型为template表示可以差插槽
          type: 'template',
          // 插槽的名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 添加分类的表单对象
      addCateForm: {
        // 分类父id
        cat_pid: 0,
        // 分类名称
        cat_name: '',
        // 分类层级
        cat_level: 0
      },
      // 添加分类表单验证规则
      addCateFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 父级分类列表
      parentsCateList: [],
      // 级联选择器配置表
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 级联选择器选中的值
      selectedKeys: [],
      // 需要编辑的分类数据
      editCateForm: {}
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      // 发送请求
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      // 获取分类成功，保存数据到data中
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // 重新发送请求渲染页面
      this.getCateList()
    },
    // 监听pagenum变化
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      // 重新发送请求渲染页面
      this.getCateList()
    },
    // 显示并渲染添加分类对话框
    addCateDialogShow() {
      // 调用方法获取父级分类数据
      this.getParentsCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类数据
    async getParentsCateList() {
      // 发送请求，只需要前两层，type值为2
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败')
      // 获取列表成功，存到data中
      this.parentsCateList = res.data
    },
    // 级联选择器选项发生变化回调函数
    handleChange() {
      // console.log(this.selectedKeys)
      // 将级联选择器的数据同步到addCateForm中
      // 如果selectedKeys长度不等于0说明选中了子菜单
      if (this.selectedKeys.length !== 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 关闭添加分类对话框重置表单
    closeAddCateDialog() {
      // 重置表单数据
      this.$refs.addCateFormRef.resetFields()
      // 重置级联选择器选中的值
      this.selectedKeys = []
      // 重置添加分类表单对象相应的数据
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 发送请求添加分类
    addCate() {
      // 先预验证
      this.$refs.addCateFormRef.validate(async valid => {
        // 验证失败阻止程序向下运行
        if (!valid) return false
        // 验证成功发送请求
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        // 如果请求失败
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        // 添加分类成功,关闭对话框，重新渲染数据
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 展示并渲染编辑分类的对话框
    async showEditCateDialog(id) {
      // 发送请求查询数据
      const { data: res } = await this.$http.get('categories/' + id)
      // 如果查询失败
      if (res.meta.status !== 200) return this.$message.error('查询分类数据失败')
      // 查询成功,把数据存到data中，显示编辑对话框
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    // 发送请求提交编辑分类
    editCate() {
      // 先预验证
      this.$refs.editCateFormRef.validate(async valid => {
        // 验证失败阻止程序向下执行
        if (!valid) return false
        // 发送请求
        const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, { cat_name: this.editCateForm.cat_name })
        // 如果请求失败
        if (res.meta.status !== 200) return this.$message.error('修改分类信息失败')
        // 请求成功,重新渲染数据，关闭对话框
        this.$message.success('修改分类信息成功')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 删除分类功能
    async removeCateById(id) {
      // 弹窗功能
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户取消删除
      if (confirmResult !== 'confirm') return this.$message.info('取消删除成功')
      // 用户确认删除,发送请求
      const { data: res } = await this.$http.delete('categories/' + id)
      // 如果删除失败
      if (res.meta.status !== 200) return this.$message.error('删除分类失败')
      // 删除成功，重新渲染数据
      this.$message.success('删除分类成功')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.mg-bottom {
  margin-bottom: 20px;
}

.el-cascader {
  width: 100%;
}
</style>
