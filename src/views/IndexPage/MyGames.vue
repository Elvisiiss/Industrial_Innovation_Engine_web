<template>
  <div class="my-games-container">
    <h2>我的游戏</h2>

    <!-- 移除上传游戏按钮 -->
    <el-table :data="games" style="width: 100%">
      <el-table-column prop="gameName" label="游戏名称" />
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.originalStatus)">
            {{ row.displayStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="标签">
        <template #default="{ row }">
          <el-tag
              v-for="(tag, index) in row.tags"
              :key="index"
              type="info"
              style="margin-right: 5px; margin-bottom: 5px"
          >
            {{ tag.tagName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260">
        <template #default="{ row }">
          <el-button
              size="small"
              @click="editGame(row)"
              :disabled="row.originalStatus === 'DELETED'"
          >
            编辑
          </el-button>
          <el-button
              size="small"
              :type="getActionType(row.originalStatus)"
              @click="toggleGameStatus(row)"
              :disabled="row.originalStatus === 'DELETED'"
          >
            {{ getActionText(row.originalStatus) }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'  // 新增路由导入
import { useAuthStore } from '@/stores/auth'
import gameApi from '@/api/game'
import { ElMessage } from 'element-plus'

const router = useRouter()  // 初始化路由
const authStore = useAuthStore()
const games = ref([])

// 状态中文映射
const mapStatus = (status) => {
  switch (status) {
    case 'UNAPPROVED': return '未审核'
    case 'PUBLIC': return '公共的'
    case 'PRIVATE': return '私有的'
    case 'APPROVED': return '审核拒绝'
    case 'DELETED': return '已删除'
    default: return status
  }
}

// 获取状态标签类型
const getStatusType = (originalStatus) => {
  switch (originalStatus) {
    case 'UNAPPROVED': return 'info'
    case 'PUBLIC': return 'success'
    case 'PRIVATE': return 'warning'
    case 'APPROVED': return 'danger'
    case 'DELETED': return 'error'
    default: return 'default'
  }
}

// 获取操作按钮文本
const getActionText = (originalStatus) => {
  switch (originalStatus) {
    case 'PUBLIC': return '设为私有'
    case 'PRIVATE': return '发布'
    case 'UNAPPROVED': return '设为私有'
    case 'APPROVED': return '重新提交'
    default: return '操作'
  }
}

// 获取操作按钮类型
const getActionType = (originalStatus) => {
  switch (originalStatus) {
    case 'PUBLIC': return 'warning'
    case 'PRIVATE': return 'primary'
    case 'UNAPPROVED': return 'warning'
    case 'APPROVED': return 'primary'
    default: return 'default'
  }
}

// 获取用户游戏
const fetchGames = async () => {
  try {
    const response = await gameApi.getUserGames(authStore.user.user_id)
    if (response.data.code === 'Success') {
      games.value = response.data.data.map(game => ({
        ...game,
        displayStatus: mapStatus(game.status),
        originalStatus: game.status
      }))
    } else {
      ElMessage.error(response.data.msg || '获取游戏列表失败')
    }
  } catch (error) {
    ElMessage.error('获取游戏列表失败: ' + (error.response?.data?.message || error.message))
  }
}

// 切换游戏状态
const toggleGameStatus = async (game) => {
  try {
    let newStatus
    switch (game.originalStatus) {
      case 'PUBLIC':
        newStatus = 'PRIVATE'
        break
      case 'PRIVATE':
        newStatus = 'UNAPPROVED'
        break
      case 'UNAPPROVED':
        newStatus = 'PRIVATE'
        break
      case 'APPROVED':
        newStatus = 'UNAPPROVED'
        break
      default:
        return
    }

    await gameApi.changeGameStatus(game.id, newStatus, "-")
    ElMessage.success('游戏状态已更新')
    fetchGames() // 刷新列表
  } catch (error) {
    ElMessage.error('更新状态失败: ' + (error.response?.data?.message || error.message))
  }
}

// 编辑游戏 - 跳转到UploadGame页面并携带gameId
const editGame = (game) => {
  router.push({
    path: '/index',
    query: { page:'upload',gameId: game.id }
  })
}

onMounted(fetchGames)
</script>

<style scoped>
.my-games-container {
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
</style>
