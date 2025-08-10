<template>
  <div class="review-container">
    <h2>待审核游戏</h2>

    <div class="game-cards">
      <div v-for="game in pendingGames" :key="game.id" class="game-card">
        <div class="card-header">
          <div class="game-cover" @click="previewGame(game)">
            <el-image
                :src="game.gamePicture"
                fit="cover"
                class="cover-image"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="cover-hover">点击进入游戏</div>
          </div>

          <div class="game-info">
            <h3 class="game-name">{{ game.gameName }}</h3>
            <div class="game-status">
              <el-tag :type="statusType(game.status)" size="small">
                {{ statusText(game.status) }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="card-body">
          <p class="game-description">{{ game.gameDescription }}</p>

          <div class="game-tags">
            <el-tooltip
                v-for="tag in game.tags"
                :key="tag.id"
                placement="top"
                :content="tag.tagDescription || '暂无描述'"
            >
              <el-tag size="small" class="game-tag">
                {{ tag.tagName }}
              </el-tag>
            </el-tooltip>
          </div>
        </div>

        <div class="card-actions">
          <el-button size="small" @click="previewGame(game)">预览</el-button>
          <el-button size="small" type="success" @click="approveGame(game)">通过</el-button>
          <el-button size="small" type="danger" @click="rejectGame(game)">拒绝</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import gameApi from '@/api/game'

const pendingGames = ref([])

// 获取待审核游戏
const fetchPendingGames = async () => {
  try {
    const response = await gameApi.getPendingGames()
    pendingGames.value = response.data.data.map(game => ({
      ...game,
      gamePicture: formatImageUrl(game.gamePicture)
    }))
  } catch (error) {
    ElMessage.error('获取待审核游戏失败: ' + error.message)
  }
}

// 格式化图片URL
const formatImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('/api')) return `${window.location.origin}${url}`
  return `${window.location.origin}/api${url}`
}

// 状态显示
const statusText = (status) => {
  const map = {
    UNAPPROVED: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝'
  }
  return map[status] || status
}

const statusType = (status) => {
  const map = {
    UNAPPROVED: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger'
  }
  return map[status] || ''
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
  window.open(game.gameUrl, '_blank')
}

const approveGame = (game) => {
  ElMessageBox.confirm(`确定通过游戏 "${game.gameName}" 的审核吗？`, '审核确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    const success = await reviewGame(game.id, 'approve', '')
    if (success) {
      ElMessage.success(`游戏 "${game.gameName}" 已审核通过`)
      fetchPendingGames()
    }
  }).catch(() => {})
}

const rejectGame = (game) => {
  ElMessageBox.prompt('请输入拒绝原因', '审核拒绝', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /.{5,}/,
    inputErrorMessage: '拒绝原因至少5个字符'
  }).then(async ({value}) => {
    const success = await reviewGame(game.id, 'reject', value)
    if (success) {
      ElMessage.error(`游戏 "${game.gameName}" 已拒绝`)
      fetchPendingGames()
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchPendingGames()
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
  margin-bottom: 20px;
}

.game-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.game-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.game-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  position: relative;
}

.game-cover {
  position: relative;
  display: block;
  height: 180px;
  overflow: hidden;
  cursor: pointer;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.game-cover:hover .cover-image {
  transform: scale(1.05);
}

.cover-hover {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 8px 0;
  font-size: 14px;
  transform: translateY(100%);
  transition: transform 0.2s;
}

.game-cover:hover .cover-hover {
  transform: translateY(0);
}

.game-info {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-name {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.game-status {
  margin-left: 10px;
}

.card-body {
  padding: 0 16px 16px;
  flex: 1;
}

.game-description {
  margin: 0 0 12px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.game-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.game-tag {
  cursor: help;
}

.card-actions {
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  color: #999;
}
</style>
