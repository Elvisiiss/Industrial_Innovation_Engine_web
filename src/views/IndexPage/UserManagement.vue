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
      <el-table-column prop="userNumber" label="用户码" />
      <el-table-column prop="userNickName" label="用户昵称" />
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="userRole" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="roleTagType(row.userRole)">
            {{ row.userRole }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="mail" label="邮箱" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="(newStatus) => toggleUserStatus(row, newStatus)"
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
        <el-form-item label="用户码" required>
          <el-input v-model="newUser.userNumber" />
        </el-form-item>
        <el-form-item label="用户昵称" required>
          <el-input v-model="newUser.userNickName" />
        </el-form-item>
        <el-form-item label="用户名" required>
          <el-input v-model="newUser.userName" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="newUser.password" type="password" />
        </el-form-item>
        <el-form-item label="确认密码" required>
          <el-input v-model="newUser.confirmPassword" type="password" />
        </el-form-item>
        <el-form-item label="邮箱" required>
          <el-input v-model="newUser.mail" type="email" />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="newUser.userRole">
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
import {ref, computed, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Plus, Search} from '@element-plus/icons-vue'
import userApi from '@/api/user'

const users = ref([])

const searchKeyword = ref('')
const showAddDialog = ref(false)
const newUser = ref({
  userNumber: '',
  userNickName: '',
  userName: '',
  password: '',
  confirmPassword: '',
  mail: '',
  userRole: '学生',
  status: 1
})

// 过滤用户列表
const filteredUsers = computed(() => {
  if (!searchKeyword.value) return users.value
  const keyword = searchKeyword.value.toLowerCase()
  return users.value.filter(user =>
      (user.userNumber && user.userNumber.toLowerCase().includes(keyword)) ||
      (user.userNickName && user.userNickName.toLowerCase().includes(keyword)) ||
      (user.userName && user.userName.toLowerCase().includes(keyword)) ||
      (user.mail && user.mail.toLowerCase().includes(keyword)))
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
      user_number: newUser.value.userNumber,
      user_nick_name: newUser.value.userNickName,
      user_name: newUser.value.userName,
      passwd: newUser.value.password,
      mail: newUser.value.mail,
      user_role: newUser.value.userRole,
      status: newUser.value.status
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
  ElMessageBox.confirm(`确定删除用户 "${user.userName}" 吗？此操作不可恢复！`, '删除确认', {
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
const toggleUserStatus = async (user, newStatus) => {
  try {
    // 直接使用传入的新状态值（newStatus）
    await userApi.changeUserStatus(user.id, newStatus);
    const action = newStatus === 1 ? '启用' : '禁用';
    ElMessage.success(`用户 "${user.userName}" 已${action}`);
  } catch (error) {
    // 失败时恢复原始状态（注意：newStatus 是修改后的值，原始值是 1 - newStatus）
    user.status = 1 - newStatus;
    ElMessage.error('状态更新失败: ' + error.message);
  }
}

const resetNewUser = () => {
  newUser.value = {
    userNumber: '',
    userNickName: '',
    userName: '',
    password: '',
    confirmPassword: '',
    mail: '',
    userRole: '学生',
    status: 1
  }
}

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await userApi.getUsers()
    users.value = response.data.data.map(user => ({
      ...user,
      // 确保状态值为数字
      status: parseInt(user.status)
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
