<template>
  <div class="user-management">
    <h2>用户管理</h2>

    <div class="actions">
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon> 添加用户
      </el-button>
      <el-input
          v-model="searchKeyword"
          placeholder="搜索用户..."
          style="width: 300px; margin-left: 15px"
          clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <el-table :data="filteredUsers" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="realName" label="真实姓名" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="roleTagType(row.role)">
            {{ row.role }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="createdAt" label="注册时间" width="180" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch
              v-model="row.status"
              :active-value="'active'"
              :inactive-value="'inactive'"
              @change="toggleUserStatus(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="editUser(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteUser(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加用户对话框 -->
    <el-dialog v-model="showAddDialog" title="添加新用户">
      <el-form :model="newUser" label-width="100px">
        <el-form-item label="用户名" required>
          <el-input v-model="newUser.username" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="newUser.password" type="password" />
        </el-form-item>
        <el-form-item label="确认密码" required>
          <el-input v-model="newUser.confirmPassword" type="password" />
        </el-form-item>
        <el-form-item label="真实姓名" required>
          <el-input v-model="newUser.realName" />
        </el-form-item>
        <el-form-item label="邮箱" required>
          <el-input v-model="newUser.email" type="email" />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="newUser.role">
            <el-option label="管理员" value="管理员" />
            <el-option label="教师" value="教师" />
            <el-option label="学生" value="学生" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addUser">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import userApi from '@/api/user'

const users = ref([])

const searchKeyword = ref('')
const showAddDialog = ref(false)
const newUser = ref({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  email: '',
  role: '学生',
  status: 'active'
})

// 过滤用户列表
const filteredUsers = computed(() => {
  if (!searchKeyword.value) return users.value
  const keyword = searchKeyword.value.toLowerCase()
  return users.value.filter(user =>
      user.username.toLowerCase().includes(keyword) ||
      user.realName.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword))
})

const roleTagType = (role) => {
  const types = {
    '管理员': 'danger',
    '教师': 'warning',
    '学生': 'success'
  }
  return types[role] || ''
}

const addUser = async () => {
  if (newUser.value.password !== newUser.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  try {
    const userData = {
      username: newUser.value.username,
      password: newUser.value.password,
      real_name: newUser.value.realName,
      email: newUser.value.email,
      role: newUser.value.role,
      is_active: newUser.value.status === 'active'
    }

    await userApi.createUser(userData)
    ElMessage.success('用户添加成功')
    showAddDialog.value = false
    resetNewUser()
    await fetchUsers() // 刷新列表
  } catch (error) {
    ElMessage.error('添加用户失败: ' + (error.response?.data?.message || error.message))
  }
}

const editUser = (user) => {
  // 实现编辑逻辑
  console.log('编辑用户:', user)
}

// 删除用户
const deleteUser = async (user) => {
  ElMessageBox.confirm(`确定删除用户 "${user.real_name}" 吗？此操作不可恢复！`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await userApi.deleteUser(user.id)
      users.value = users.value.filter(u => u.id !== user.id)
      ElMessage.success('用户已删除')
    } catch (error) {
      ElMessage.error('删除失败: ' + error.message)
    }
  })
}

// 切换用户状态
const toggleUserStatus = async (user) => {
  try {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    await userApi.changeUserStatus(user.id, newStatus === 'active')

    const action = newStatus === 'active' ? '启用' : '禁用'
    ElMessage.success(`用户 "${user.real_name}" 已${action}`)
    await fetchUsers() // 刷新列表
  } catch (error) {
    ElMessage.error('状态更新失败: ' + error.message)
    await fetchUsers() // 刷新回原状态
  }
}

const resetNewUser = () => {
  newUser.value = {
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    email: '',
    role: '学生',
    status: 'active'
  }
}

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await userApi.getUsers()
    users.value = response.data.map(user => ({
      ...user,
      createdAt: new Date(user.created_at).toLocaleDateString(),
      status: user.is_active ? 'active' : 'inactive'
    }))
  } catch (error) {
    ElMessage.error('获取用户列表失败: ' + error.message)
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
.user-management {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  color: #2c3e50;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
</style>
