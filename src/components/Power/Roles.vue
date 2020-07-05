<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开区域 -->
        <el-table-column type="expand">
          <template v-slot="slotProps">
            <el-row :class="['border-bottom',index1 ===0 ? 'border-top' :'','vcenter']"
              v-for="(item1,index1) in slotProps.row.children" :key="item1.id">
              <!-- 循环渲染一级权限 -->
              <el-col :span="6">
                <el-tag closable @close="removeRightById(slotProps.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="18">
                <!-- 循环渲染二级权限 -->
                <el-row :class="[index2===0?'':'border-top','vcenter']" v-for="(item2,index2) in item1.children"
                  :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(slotProps.row,item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 循环渲染三级权限 -->
                    <el-tag closable type="warning" v-for="item3 in item2.children" :key="item3.id"
                      @close="removeRightById(slotProps.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引 -->
        <el-table-column type="index"></el-table-column>
        <!-- 内容 -->
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="slotProps">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRoleDialog(slotProps.row)">编辑
            </el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoleById(slotProps.row.id)">删除
            </el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(slotProps.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 展示分配权限对话框 -->
    <el-dialog title="提示" :visible.sync="setRightDialogVisible" width="50%">
      <!-- 树形控件区域 -->
      <el-tree :data="rightList" :props="treeProps" show-checkbox default-expand-all node-key="id"
        :default-checked-keys="keyArry" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleDialogClose">
      <!-- 主体区域 -->
      <el-form ref="addRoleFormRef" :model="addRoleForm" :rules="addroleFormRulls" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- footer区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible" width="50%">
      <!-- 主体区域 -->
      <el-form :model="editRoleForm" :rules="addroleFormRulls" label-width="80px" ref="editRoleFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleName">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- footer区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表
      roleList: [],
      // 控制角色分配对话框显示隐藏
      setRightDialogVisible: false,
      // 控制添加角色对话框显示隐藏
      addRoleDialogVisible: false,
      // 控制编辑角色对话框显示隐藏
      editRoleDialogVisible: false,
      // 树形控件权限列表数据
      rightList: {},
      // 树形控件属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认勾选项id数组
      keyArry: [],
      // 要分配权限的角色id
      roleId: '',
      // 添加角色form
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色验证规则
      addroleFormRulls: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ]
      },
      // 编辑角色表单
      editRoleForm: {}
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      // 获取成功
      this.roleList = res.data
    },
    // 根据id移除权限
    async removeRightById(role, id) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      // 发送请求
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除角色权限失败')
      // 这里不能直接重新获取所有角色权限，不然页面会重新渲染，展开栏会关闭
      // 返回值时请求角色的最新权限，重新赋值就可以了
      role.children = res.data
    },
    // 渲染分配权限功能树形控件
    async showSetRightDialog(role) {
      // 获取角色id,赋值给roleId
      this.roleId = role.id
      // 先清空keyArray数组
      this.keyArry = []
      // 发送请求获取数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.rightList = res.data
      // 在展示对话框之前通过递归函数得到该角色的keyArray
      this.getKeyArray(role, this.keyArry)
      this.setRightDialogVisible = true
    },
    // 得到默认勾选项数组的递归函数
    getKeyArray(role, arr) {
      // 是三级权限
      if (!role.children) return arr.push(role.id)
      // 不是三级权限,role.children会是一个数组
      role.children.forEach(item => {
        this.getKeyArray(item, arr)
      })
    },
    // 发送请求分配权限
    async allotRights() {
      // 先将全选和半选的节点key值合并为一个数组
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      // 转换为符合要求的格式
      const idStr = keys.join(',')
      // 发送请求
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      // 分配角色成功，关闭对话框，重新渲染数据
      this.$message.success('分配权限成功')
      this.setRightDialogVisible = false
      this.getRoleList()
    },
    // 关闭添加角色对话框请求表单验证
    addRoleDialogClose() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 发送请求添加角色
    addRole() {
      // 先预验证
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        // 添加成功,关闭对话框重新渲染数据
        this.$message.success('添加角色成功')
        this.getRoleList()
        this.addRoleDialogVisible = false
      })
    },
    // 显示并渲染编辑角色对话框
    async editRoleDialog(role) {
      // 根据角色id查询角色信息
      const { data: res } = await this.$http.get('roles/' + role.id)
      if (res.meta.status !== 200) return this.$message.error('查询角色信息失败')
      // 查询成功，将数据保存到编辑角色表单中
      this.editRoleForm = res.data
      // 打开对话框
      this.editRoleDialogVisible = true
    },
    // 发送请求修改角色信息
    editRoleInfo() {
      // 先预验证
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return false
        // 发送请求
        const { data: res } = await this.$http.put(`roles/${this.editRoleForm.roleId}`, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('更新角色信息失败')
        // 更新成功,重新渲染数据
        this.$message.success('更新角色数据成功')
        this.getRoleList()
        this.editRoleDialogVisible = false
      })
    },
    // 删除角色功能
    async removeRoleById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消删除成功')
      // 确认删除，发送请求
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      // 删除成功，重新渲染数据
      this.$message.success('删除角色成功')
      this.getRoleList()
    }
  }
}
</script>

<style lang="less" scoped>
.border-top {
  border-top: 1px solid #eee;
}

.border-bottom {
  border-bottom: 1px solid #eee;
}

.el-tag {
  margin: 8px;
}

// 让一级和二级权限居中对齐
.vcenter {
  display: flex;
  align-items: center;
}
</style>
