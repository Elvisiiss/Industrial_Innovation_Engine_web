<template>
  <div class="review-container">
    <h2>待审核游戏</h2>

    <el-table :data="pendingGames" style="width: 100%">
      <el-table-column prop="title" label="游戏名称" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="createdAt" label="提交时间" />
      <el-table-column label="标签" width="200">
        <template #default="{ row }">
          <el-tag v-for="tag in row.tags" :key="tag" size="small" style="margin-right: 5px">
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="{ row }">
          <el-button size="small" @click="previewGame(row)">预览</el-button>
          <el-button size="small" type="success" @click="approveGame(row)">通过</el-button>
          <el-button size="small" type="danger" @click="rejectGame(row)">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>

    <h2 style="margin-top: 30px">审核历史</h2>

    <el-table :data="reviewHistory" style="width: 100%">
      <el-table-column prop="title" label="游戏名称" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="reviewedAt" label="审核时间" />
      <el-table-column label="审核结果">
        <template #default="{ row }">
          <el-tag :type="row.status === '已通过' ? 'success' : 'danger'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reviewer" label="审核人" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetails(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import gameApi from '@/api/game'

const pendingGames = ref([])
const reviewHistory = ref([])

// 获取待审核游戏
const fetchPendingGames = async () => {
  try {
    const response = await gameApi.getPendingGames()
    pendingGames.value = response.data.map(game => ({
      ...game,
      createdAt: new Date(game.created_at).toLocaleDateString(),
      tags: game.tags ? game.tags.split(',') : []
    }))
  } catch (error) {
    ElMessage.error('获取待审核游戏失败: ' + error.message)
  }
}

// 获取审核历史
const fetchReviewHistory = async () => {
  try {
    // 获取审核历史的API
    const response = await gameApi.getReviewedGames()
    reviewHistory.value = response.data.map(game => ({
      ...game,
      reviewedAt: new Date(game.reviewed_at).toLocaleDateString(),
      status: game.status === 'approved' ? '已通过' : '已拒绝',
      reviewer: game.reviewer?.name || '管理员'
    }))
  } catch (error) {
    ElMessage.error('获取审核历史失败: ' + error.message)
  }
}

// 审核游戏
const reviewGame = async (gameId, action, reason) => {
  try {
    await gameApi.reviewGame(gameId, action, reason)
    return true
  } catch (error) {
    ElMessage.error(`审核操作失败: ${error.response?.data?.message || error.message}`)
    return false
  }
}

const previewGame = (game) => {
  window.open(game.url, '_blank')
}

const approveGame = (game) => {
  ElMessageBox.confirm(`确定通过游戏 "${game.title}" 的审核吗？`, '审核确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    const success = await reviewGame(game.id, 'approve', '')
    if (success) {
      ElMessage.success(`游戏 "${game.title}" 已审核通过`)
      pendingGames.value = pendingGames.value.filter(g => g.id !== game.id)
      fetchReviewHistory()
    }
  })
}

const rejectGame = (game) => {
  ElMessageBox.prompt('请输入拒绝原因', '审核拒绝', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /.{5,}/,
    inputErrorMessage: '拒绝原因至少5个字符'
  }).then(async ({ value }) => {
    const success = await reviewGame(game.id, 'reject', value)
    if (success) {
      ElMessage.error(`游戏 "${game.title}" 已拒绝`)
      pendingGames.value = pendingGames.value.filter(g => g.id !== game.id)
      fetchReviewHistory()
    }
  })
}

onMounted(() => {
  fetchPendingGames()
  fetchReviewHistory()
})
</script>

<style scoped>
.review-container {
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
