<template>
  <div class="logs-container">
    <h2>系统操作日志</h2>

    <div class="filter-bar">
      <el-date-picker
          v-model="filterDate"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 300px; margin-right: 15px"
      />

      <el-select v-model="filterUser" placeholder="选择用户" clearable style="width: 200px; margin-right: 15px">
        <el-option
            v-for="user in users"
            :key="user.id"
            :label="user.username"
            :value="user.id"
        />
      </el-select>

      <el-select v-model="filterAction" placeholder="选择操作类型" clearable style="width: 200px">
        <el-option label="登录" value="login" />
        <el-option label="退出" value="logout" />
        <el-option label="创建游戏" value="create_game" />
        <el-option label="更新游戏" value="update_game" />
        <el-option label="删除游戏" value="delete_game" />
        <el-option label="发布游戏" value="publish_game" />
        <el-option label="审核通过" value="approve_game" />
        <el-option label="审核拒绝" value="reject_game" />
        <el-option label="创建用户" value="create_user" />
        <el-option label="更新用户" value="update_user" />
        <el-option label="删除用户" value="delete_user" />
      </el-select>
    </div>

    <el-table :data="filteredLogs" style="width: 100%">
      <el-table-column prop="timestamp" label="时间" width="180" />
      <el-table-column prop="username" label="用户" width="150" />
      <el-table-column prop="action" label="操作" width="150">
        <template #default="{ row }">
          <el-tag :type="actionTagType(row.action)">
            {{ actionLabels[row.action] || row.action }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="details" label="详情" />
      <el-table-column prop="ip" label="IP地址" width="150" />
    </el-table>

    <div class="pagination">
      <el-pagination
          background
          layout="prev, pager, next"
          :total="logs.length"
          :page-size="pageSize"
          v-model:current-page="currentPage"
      />
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import logsApi from '@/api/logs'
import userApi from '@/api/user.js'
import { ElMessage } from 'element-plus'


// 模拟用户数据改为从API获取
const users = ref([])
const logs = ref([])

// 操作类型标签
const actionLabels = {
  login: '登录',
  logout: '退出',
  create_game: '创建游戏',
  update_game: '更新游戏',
  delete_game: '删除游戏',
  publish_game: '发布游戏',
  approve_game: '审核通过',
  reject_game: '审核拒绝',
  create_user: '创建用户',
  update_user: '更新用户',
  delete_user: '删除用户'
}

// 操作类型标签样式
const actionTagType = (action) => {
  const types = {
    login: 'success',
    logout: 'info',
    create_game: '',
    update_game: '',
    delete_game: 'danger',
    publish_game: 'success',
    approve_game: 'success',
    reject_game: 'warning',
    create_user: '',
    update_user: '',
    delete_user: 'danger'
  }
  return types[action] || ''
}


const filterDate = ref('')
const filterUser = ref('')
const filterAction = ref('')
const currentPage = ref(1)
const pageSize = 10

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await userApi.getUsers()
    users.value = response.data
  } catch (error) {
    ElMessage.error('获取用户列表失败: ' + error.message)
  }
}

// 获取日志
const fetchLogs = async () => {
  try {
    const params = {
      start_date: filterDate.value?.[0]?.toISOString().split('T')[0],
      end_date: filterDate.value?.[1]?.toISOString().split('T')[0],
      user_id: filterUser.value,
      action_type: filterAction.value
    }

    const response = await logsApi.getLogs(params)
    logs.value = response.data.map(log => ({
      ...log,
      timestamp: new Date(log.created_at).toLocaleString(),
      username: log.user?.username || '未知用户'
    }))
  } catch (error) {
    ElMessage.error('获取日志失败: ' + error.message)
  }
}

// 过滤日志
const filteredLogs = computed(() => {
  let result = logs.value

  // 按用户过滤
  if (filterUser.value) {
    result = result.filter(log => log.userId === filterUser.value)
  }

  // 按操作类型过滤
  if (filterAction.value) {
    result = result.filter(log => log.action === filterAction.value)
  }

  // 按日期过滤
  if (filterDate.value && filterDate.value.length === 2) {
    const start = new Date(filterDate.value[0])
    const end = new Date(filterDate.value[1])
    end.setDate(end.getDate() + 1) // 包括结束日期

    result = result.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= start && logDate < end
    })
  }

  // 分页
  const startIndex = (currentPage.value - 1) * pageSize
  return result.slice(startIndex, startIndex + pageSize)
})

// 添加侦听器
watch([filterDate, filterUser, filterAction], () => {
  fetchLogs()
})

onMounted(() => {
  fetchUsers()
  fetchLogs()
})
</script>

<style scoped>
.logs-container {
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

.filter-bar {
  display: flex;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
