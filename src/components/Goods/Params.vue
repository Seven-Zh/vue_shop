<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 头部的警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon>
      </el-alert>

      <!-- 选择商品区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择器区域 -->
          <!-- 级联选择器渲染父级分类 -->
          <!-- options属性是渲染的数据源 -->
          <!-- props属性是配置选项 -->
          <!-- 注意v-model绑定的是一个数组 -->
          <el-cascader v-model="selectedKeys" :options="cateList" :props="cascaderProps" clearable
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>

      <!-- tabs标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <!-- 添加动态参数tab -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加动态参数按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item,i) in slotProps.row.attr_vals" :key="i" closable
                  @close="handleClose(i,slotProps.row)">{{item}}</el-tag>
                <!-- 文本输入框 -->
                <el-input class="input-new-tag" v-if="slotProps.row.inputVisible" v-model="slotProps.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slotProps.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <!-- 数据 -->
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button type="primary" class="el-icon-edit" size="mini" @click="showEditDialog(slotProps.row)">编辑
                </el-button>
                <el-button type="danger" class="el-icon-delete" size="mini"
                  @click="removeParamsById(slotProps.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性tab -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加静态按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性
          </el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item,i) in slotProps.row.attr_vals" :key="i" closable
                  @close="handleClose(i,slotProps.row)">{{item}}</el-tag>
                <!-- 文本输入框 -->
                <el-input class="input-new-tag" v-if="slotProps.row.inputVisible" v-model="slotProps.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slotProps.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <!-- 数据 -->
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button type="primary" class="el-icon-edit" size="mini" @click="showEditDialog(slotProps.row)">编辑
                </el-button>
                <el-button type="danger" class="el-icon-delete" size="mini"
                  @click="removeParamsById(slotProps.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" width="50%" @close="addFormClose">
      <!-- 表单区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- footer区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog :title="'修改'+titleText" :visible.sync="editDialogVisible" width="50%" @close="editFormClose">
      <!-- 表单区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- footer区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择器配置属性
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器双向绑定数据
      selectedKeys: [],
      // 标签页显示的页面
      activeName: 'many',
      // 静态属性数据
      onlyTableData: [],
      // 动态参数数据
      manyTableData: [],
      // 添加表单
      addForm: {
        attr_name: ''
      },
      // 添加表单验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      // 控制添加对话框显示与隐藏
      addDialogVisible: false,
      // 控制编辑对话框的显示隐藏
      editDialogVisible: false,
      // 编辑表单
      editForm: {
        attr_vals: []
      },
      // 编辑表单验证规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      // 将数据保存到data中
      this.cateList = res.data
    },
    // 级联选择器选中节点变化时的回调函数
    async handleChange() {
      this.getParamsList()
    },
    // tab页点击后触发的函数
    handleTabsClick() {
      this.getParamsList()
    },
    // 获取参数列表的函数
    async getParamsList() {
      // 先判断是否选中的是三级分类
      if (this.selectedKeys.length !== 3) {
        // 清空数组
        this.selectedKeys = []
        // 清空查询到的参数数据
        this.onlyTableData = []
        this.manyTableData = []
        return
      }
      // 发送请求获取参数列表
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } })
      // 如果失败
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      // 循环res.data把attr_vals转换为数组
      res.data.forEach(item => {
        // attr_vals不为空才转换为数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 在这里给每一个参数定义自己的inputVisible和inputValue
        item.inputVisible = false
        item.inputValue = ''
      })
      // 成功,需要判断是静态属性还是动态参数
      if (this.activeName === 'only') {
        this.onlyTableData = res.data
      } else {
        this.manyTableData = res.data
      }
    },
    // 监听添加对话框关闭
    addFormClose() {
      // 重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 发送请求添加参数
    addParams() {
      // 先预验证
      this.$refs.addFormRef.validate(async valid => {
        // 如果失败
        if (!valid) return false
        // 成功则发送请求
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        // 重新获取参数
        this.getParamsList()
        this.addDialogVisible = false
      })
    },
    // 监听编辑对话框关闭
    editFormClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 展示并渲染编辑对话框
    async showEditDialog(row) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        params: {
          attr_sel: this.activeName,
          attr_vals: row.attr_vals
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      // 把数据存到data中
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 发送请求提交编辑
    editParams() {
      // 预验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        // 发送请求
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_sel: this.activeName,
          attr_name: this.editForm.attr_name,
          // 在这里要传递attr_vals参数，不然会出bug
          attr_vals: this.editForm.attr_vals
        })
        if (res.meta.status !== 200) return this.$message.error('更新参数失败')
        this.$message.success('更新参数成功')
        this.getParamsList()
        this.editDialogVisible = false
      })
    },
    // 删除参数功能
    async removeParamsById(id) {
      // 弹窗功能
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户取消删除
      if (confirmResult !== 'confirm') return this.$message.info('取消删除成功')
      // 用户确认删除,发送请求
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      this.$message.success('删除参数成功')
      // 重新渲染数据
      this.getParamsList()
    },
    // 文本输入框失去焦点或者enter键弹起触发
    async handleInputConfirm(row) {
      // 判断是否输入的是空格
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 不为空，后续处理
      // 将inputValue保存到参数数据中
      row.attr_vals.push(row.inputValue)
      row.inputValue = ''
      row.inputVisible = false
      // 发送请求
      this.saveParams(row)
    },
    // 切换文本框和添加按钮
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      // $nextTick方法是在页面重新渲染之后才会触发
      // 如果不在这个函数里调用focus方法，可能input元素还没渲染出来，就去给input调用focus方法会报错
      this.$nextTick(_ => {
        // 通过获取到input的dom元素添加focus方法
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除参数项
    handleClose(i, row) {
      // 删除data中相应数据
      row.attr_vals.splice(i, 1)
      // 发送请求
      this.saveParams(row)
    },
    // 发送请求更新参数项
    async saveParams(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      // 如果请求失败
      if (res.meta.status !== 200) return this.$message.error('更新参数项失败')
      // 请求成功
      this.$message.success('更新参数项成功')
    }
  },
  computed: {
    // 控制添加按钮的禁用属性
    isBtnDisabled() {
      // 如果级联选择器双向绑定的数组长度不为3则表示没有选择三级分类
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 选中的三级分类的id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 计算添加对话框的提示
    titleText() {
      // 判断是静态属性还是动态参数tab
      if (this.activeName === 'only') {
        return '静态属性'
      } else {
        return '动态参数'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin: 20px 0;
}

.el-tag {
  margin: 0 5px;
}

.input-new-tag {
  width: 150px;
}
</style>
