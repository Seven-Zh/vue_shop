<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="9">
          <!-- 搜索框 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserInfo">
            <el-button slot="append" icon="el-icon-search" @click="getUserInfo"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <!-- 搜索按钮 -->
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe row-key="id">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="slotProps">
            <el-switch v-model="slotProps.row.mg_state" @change="userStateChange(slotProps.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template v-slot="slotProps">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUser(slotProps.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(slotProps.row.id)">
            </el-button>
            <!-- 分配角色 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRoleDialog(slotProps.row)">
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 3, 4]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <!-- 主体区域 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRulls" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- footer区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <!-- 主体区域 -->
      <el-form :model="editForm" :rules="editFormRulls" label-width="80px" ref="editFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- footer区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配用户角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setUserRoleDialogVisible" width="50%" @close="resetInfo">
      <p>当前的用户：{{userInfo.username}}</p>
      <p>当前的角色:{{userInfo.role_name}}</p>
      <p>
        分配新角色：
        <el-select v-model="selectValue" placeholder="请选择">
          <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
          </el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setUserRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setUserRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义手机号验证规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
      if (regMobile.test(value)) return cb()
      cb(new Error('请输入合法的手机号'))
    }
    // 自定义邮箱验证规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (regEmail.test(value)) return cb()
      cb(new Error('请输入合法的邮箱'))
    }
    return {
      // 获取用户列表数据的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 用户列表数据
      userList: [],
      total: 0,
      // 添加用户对话框
      addDialogVisible: false,
      // 修改用户对话框
      editDialogVisible: false,
      // 分配用户角色对话框
      setUserRoleDialogVisible: false,
      // 添加用户表单
      addForm: {
        username: '',
        password: '',
        mobile: '',
        email: ''
      },
      // 添加用户验证规则
      addFormRulls: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入用邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 编辑用户的信息
      editForm: {},
      // 编辑用户验证规则
      editFormRulls: {
        email: [
          { required: true, message: '请输入用邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 要被分配角色的用户信息
      userInfo: {},
      // 所有角色列表
      rolesList: [],
      // select选择器选中的值
      selectValue: ''
    }
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    // 获取用户列表信息
    async getUserInfo() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserInfo()
    },
    // 监听page
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserInfo()
    },
    // 用户状态变化
    async userStateChange(userInfo) {
      // 发送请求跟新用户状态信息
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        // 如果更新失败，将用户状态取反，保证用户界面的按钮不变
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('修改用户状态失败')
      }
      this.$message.success('更新用户数据成功')
    },
    // 对话框关闭重置表单
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加用户
    addUser() {
      // 先对表单进行预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        // 发起添加用户请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        // 关闭对话框
        this.addDialogVisible = false
        // 重新渲染数据
        this.getUserInfo()
      })
    },
    // 修改用户功能
    async editUser(id) {
      // 发送请求获取用户信息
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 关闭修改用户对话框重置表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 预验证并发送修改用户信息请求
    editUserInfo() {
      // 预验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 验证通过,发送请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) return this.$message.error('修改用户信息失败')
        // 修改用户信息成功后，关闭表单，重新渲染数据
        this.$message.success('修改用户信息成功')
        this.editDialogVisible = false
        this.getUserInfo()
      })
    },
    // 根据id删除用户功能
    async removeUserById(id) {
      // 调用弹窗方法
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除用')
      // 发送请求删除用户
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      // 删除用户成功，重新渲染数据
      this.$message.success('删除用户成功')
      this.getUserInfo()
    },
    // 打开并渲染分配用户角色对话框
    async showSetRoleDialog(userInfo) {
      // 把拿到的用户信息放到data数据中
      this.userInfo = userInfo
      // 获取角色列表，存到data数据中
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesList = res.data
      // 展示对话框
      this.setUserRoleDialogVisible = true
    },
    // 发送请求,分配用户角色
    async setUserRole() {
      if (!this.selectValue) return this.$message.error('请选择要分配的角色')
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectValue
      })
      if (res.meta.status !== 200) return this.$message.error('设置角色失败')
      // 设置角色成功后，关闭对话框，重新渲染数据
      this.$message.success('设置角色成功')
      this.setUserRoleDialogVisible = false
      this.getUserInfo()
    },
    // 对话框关闭，重置数据
    resetInfo() {
      this.selectValue = ''
    }
  }
}
</script>

<style lang="less" scoped>
</style>
