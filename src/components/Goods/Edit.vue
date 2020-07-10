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
      <el-alert title="修改商品信息" type="danger" :closable="false" show-icon center>
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

      <el-form :model="goodInfo" :rules="editGoodFormRules" ref="goodInfoRef" label-width="100px" label-position="top">
        <!-- tab栏区域 -->
        <el-tabs tab-position="left" v-model="activeIndex">
          <!-- 基本信息区域 -->
          <el-tab-pane label="基本信息" name="0">
            <!-- 其他参数 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goodInfo.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="goodInfo.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="goodInfo.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="goodInfo.goods_number"></el-input>
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
            <quill-editor v-model="goodInfo.goods_introduce" />
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="addBtn" @click="submitEdit">修改商品</el-button>
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
      // 商品信息
      goodInfo: {},
      // 步骤条和tab栏绑定的数据
      activeIndex: 0,
      editGoodFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' },
        { type: 'number', message: '请输入数字', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' },
        { type: 'number', message: '请输入数字', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' },
        { type: 'number', message: '请输入数字', trigger: 'blur' }]
      },
      // 动态参数
      manyDataList: [],
      // 静态属性
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
    this.getGoodInfo()
  },
  methods: {
    // 根据id查询商品信息
    async getGoodInfo() {
      // 发送请求
      const { data: res } = await this.$http.get('goods/' + this.goodId)
      this.goodInfo = res.data
      // 处理数据，将attrs转换为动态参数和静态属性存储到data
      // 处理动态参数
      const manyDataList = res.data.attrs.filter(item => {
        return item.attr_sel === 'many'
      })
      manyDataList.forEach(item => {
        item.attr_vals = item.attr_vals.split(',')
      })
      this.manyDataList = manyDataList
      // 处理静态属性
      const onlyDataList = res.data.attrs.filter(item => {
        return item.attr_sel === 'only'
      })
      this.onlyDataList = onlyDataList
      // 将图片属性清空
      this.goodInfo.pics = []
      // 清空attrs属性
      this.goodInfo.attrs = []
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
      const i = this.goodInfo.pics.findIndex(item => {
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
        this.goodInfo.pics.push(picInfo)
        console.log(this.goodInfo)
      }
    },
    // 发送请求提交编辑
    submitEdit() {
      // 预验证
      this.$refs.goodInfoRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项')
        // 处理attrs
        // 循环manyDataList,获取动态参数
        this.manyDataList.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(',') }
          // 把动态参数添加到attrs中
          this.goodInfo.attrs.push(newInfo)
        })
        // 循环onlyDataList,获取动态参数
        this.onlyDataList.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          // 把静态属性添加到attrs中
          this.goodInfo.attrs.push(newInfo)
        })
        // 发送请求
        const { data: res } = await this.$http.put('goods/' + this.goodId, this.goodInfo)
        if (res.meta.status !== 200) return this.$message.error(res.meta.message)
        // 添加成功，导航到商品列表页面
        this.$message.success('修改商品信息成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 计算商品id
    goodId() {
      return this.$route.params.id
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
