<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" :closable="false" show-icon center>
      </el-alert>

      <!-- 步骤条区域 -->
      <el-steps :active="activeIndex - 0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="addGoodForm" :rules="addGoodFormRules" ref="addGoodFormRef" label-width="100px"
        label-position="top">
        <!-- tab栏区域 -->
        <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClick">
          <!-- 基本信息区域 -->
          <el-tab-pane label="基本信息" name="0">
            <!-- 级联选择器 选择商品分类-->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="goods_cat" :options="cateList" :props="cateProps" @change="handleChange">
              </el-cascader>
            </el-form-item>
            <!-- 其他参数 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="addGoodForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="addGoodForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="addGoodForm.goods_number"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染动态参数 -->
            <!-- 循环manyDataList中的每一项 -->
            <el-form-item v-for="item1 in manyDataList" :key="item1.attr_id" :label="item1.attr_name">
              <el-checkbox-group v-model="item1.attr_vals">
                <el-checkbox :label="item2" v-for="(item2,i) in item1.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染商品属性 -->
            <el-form-item v-for="item in onlyDataList" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 添加图片区域 -->
            <el-upload action="http://127.0.0.1:8888/api/private/v1/upload" :on-preview="handlePreview"
              :on-remove="handleRemove" list-type="picture" :headers="upHeaders" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 商品内容区域，富文本编辑器 -->
            <quill-editor v-model="addGoodForm.goods_introduce" />
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="addBtn" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewiDalogVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 激活的步骤条
      activeIndex: 0,
      // 添加商品的表单对象
      addGoodForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        // 图片临时路径
        pics: [],
        // 商品描述
        goods_introduce: '',
        // 商品的参数
        attrs: []
      },
      // 商品所属分类数组,级联选择器绑定的数组
      goods_cat: [],
      // 添加商品的表单验证规则
      addGoodFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' },
        { type: 'number', message: '请输入数字', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' },
        { type: 'number', message: '请输入数字', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' },
        { type: 'number', message: '请输入数字', trigger: 'blur' }]
      },
      // 商品分类列表
      cateList: [],
      // 级联选择器配置
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 动态参数列表
      manyDataList: [],
      // 静态属性列表
      onlyDataList: [],
      // 图片上传的请求头
      upHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的临时链接
      previewPath: '',
      // 控制预览图片对话框显示隐藏
      previewiDalogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.cateList = res.data
    },
    // 级联选择器选项改变触发
    handleChange() {
      // 阻止选中三级以外的分类
      if (this.goods_cat.length !== 3) {
        this.goods_cat = []
      }
    },
    // tab栏切换之前触发，可以阻止tab栏切换
    beforeTabLeave(activeName, oldActiveName) {
      // 如果处于第一个tab栏并且没有选择商品分类，组织切换tab栏
      if (oldActiveName === '0' && this.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // 点击tab栏获取数据
    async tabClick() {
      // 判断在哪个tab栏
      if (this.activeIndex === '1') {
        // 发送请求获取动态参数列表
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        // 失败
        if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
        // 成功
        // 赋值之前把每一项的attr_vals转换为数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
        this.manyDataList = res.data
      } else if (this.activeIndex === '2') {
        // 发送请求获取静态属性
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        // 失败
        if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
        // 成功
        this.onlyDataList = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      // 保存图片临时链接到data中
      this.previewPath = file.response.data.url
      this.previewiDalogVisible = true
    },
    // 移除图片的函数
    handleRemove(file) {
      // 在addGoodForm.pics中找到对应的临时路径并移除
      const temp = file.response.data.tmp_path
      // 找到索引号
      const i = this.addGoodForm.pics.findIndex(item => {
        return item.pic === temp
      })
      this.addGoodForm.pics.splice(i, 1)
    },
    // 图片上传成功后，将临时路径保存到请求参数中
    handleSuccess(response) {
      if (response.meta.status === 200) {
        const picInfo = {
          pic: response.data.tmp_path
        }
        // 将临时路径保存到请求参数中
        this.addGoodForm.pics.push(picInfo)
      }
    },
    // 发送请求添加商品
    addGood() {
      // 先预验证
      this.$refs.addGoodFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项')
        // 发送请求之前，需要处理表单数据
        // 处理goods_cat，将goods_cat转换为字符串保存到addGoodForm中
        this.addGoodForm.goods_cat = this.goods_cat.join(',')
        // 处理attrs
        // 循环manyDataList,获取动态参数
        this.manyDataList.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(',') }
          // 把动态参数添加到attrs中
          this.addGoodForm.attrs.push(newInfo)
        })
        // 循环onlyDataList,获取动态参数
        this.onlyDataList.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          // 把静态属性添加到attrs中
          this.addGoodForm.attrs.push(newInfo)
        })
        // 发送请求添加商品
        const { data: res } = await this.$http.post('goods', this.addGoodForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.message)
        // 添加成功，导航到商品列表页面
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.goods_cat.length === 3) {
        return this.goods_cat[2]
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.addBtn {
  margin-top: 15px;
}
</style>
