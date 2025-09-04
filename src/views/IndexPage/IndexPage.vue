<template>
  <div class="index-container">
    <!-- 右上角搜索触发器 -->
    <div class="search-toggle" @click="showSearch = !showSearch">
      <el-icon><Search /></el-icon>
      <span v-if="showSearch">关闭搜索</span>
      <span v-else>搜索</span>
    </div>

    <!-- 可折叠的搜索区域 -->
    <div class="search-section" v-if="showSearch">
      <div class="search-controls">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索游戏名称、描述或标签..."
            class="search-input"
            size="large"
            @keyup.enter="performSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="performSearch" />
          </template>
        </el-input>

        <div class="filter-controls">
          <el-checkbox v-model="excludeMyGames" label="排除我的游戏" />
          <el-button type="primary" @click="performSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 游戏展示区域 -->
    <div class="games-section">
      <div class="section-header">
        <h2>游戏列表</h2>
        <span class="result-count">共找到 {{ games.length }} 个游戏</span>
      </div>

      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在加载游戏...</span>
      </div>

      <div v-else-if="games.length === 0" class="empty-state">
        <el-empty description="暂无游戏数据" />
      </div>

      <div v-else class="games-grid">
        <div v-for="game in games" :key="game.id" class="game-card">
          <div class="game-cover">
            <img
                :src="game.gamePicture || '/default-game-cover.png'"
                :alt="game.gameName"
                @error="handleImageError"
            />
            <div class="game-status" :class="game.status.toLowerCase()">
              {{ getStatusText(game.status) }}
            </div>
          </div>

          <div class="game-info">
            <h3 class="game-title">{{ game.gameName }}</h3>
            <p class="game-description">{{ truncateDescription(game.gameDescription) }}</p>

            <div class="game-tags">
              <el-tag
                  v-for="tag in game.tags"
                  :key="tag.id"
                  size="small"
                  type="info"
              >
                {{ tag.tagName }}
              </el-tag>
            </div>

            <div class="game-actions">
              <el-button type="primary" @click="playGame(game)">立即玩</el-button>
              <el-button v-if="isMyGame(game)" @click="editGame(game)">编辑</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页控件 -->
      <div v-if="games.length > 0" class="pagination-container">
        <el-pagination
            background
            layout="prev, pager, next"
            :total="totalGames"
            :page-size="pageSize"
            v-model:current-page="currentPage"
            @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Loading } from '@element-plus/icons-vue'
import gameApi from '@/api/game'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

// 搜索相关状态
const searchKeyword = ref('')
const excludeMyGames = ref(false)
const loading = ref(false)
const games = ref([])
const totalGames = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const showSearch = ref(false) // 控制搜索区域显示隐藏

// 计算我的用户ID
const myId = computed(() => authStore.user?.user_id)

// 页面加载时执行搜索
onMounted(() => {
  performSearch()
})

// 执行搜索
const performSearch = async () => {
  if (!myId.value) {
    ElMessage.error('请先登录')
    return
  }

  try {
    loading.value = true
    const searchRequest = {
      myId: myId.value,
      keyword: searchKeyword.value,
      wannaMe: !excludeMyGames.value
    }

    const response = await gameApi.searchGames(searchRequest)
    if (response.data.code === 'Success') {
      games.value = response.data.data
      totalGames.value = games.value.length
      ElMessage.success(`找到 ${games.value.length} 个游戏`)
    } else {
      ElMessage.error('搜索失败: ' + response.data.msg)
    }
  } catch (error) {
    ElMessage.error('搜索失败: ' + error.message)
    console.error('Search error:', error)
  } finally {
    loading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  excludeMyGames.value = false
  currentPage.value = 1
  performSearch()
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = '/default-game-cover.png'
}

// 截断描述文本
const truncateDescription = (text, maxLength = 100) => {
  if (!text) return '暂无描述'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'PRIVATE': '私有',
    'UNAPPROVED': '待审核',
    'APPROVED': '已发布',
    'REJECTED': '已拒绝'
  }
  return statusMap[status] || status
}

// 检查是否是自己的游戏
const isMyGame = (game) => {
  return game.creatorId === myId.value
}

// 玩游戏
const playGame = (game) => {
  window.open(game.gameUrl, '_blank')
}

// 编辑游戏
const editGame = (game) => {
  router.push(`/upload-game?gameId=${game.id}`)
}

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo(0, 0)
}
</script>

<style scoped>
.index-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

/* 搜索切换按钮 */
.search-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: #667eea;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.search-toggle:hover {
  background-color: #5a6fdd;
}

/* 搜索区域 */
.search-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.filter-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* 游戏展示区域 */
.games-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
}

.result-count {
  color: #909399;
  font-size: 0.9rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #606266;
}

.loading-state .el-icon {
  font-size: 2rem;
  margin-bottom: 15px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  padding: 60px 20px;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.game-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.game-cover {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.game-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.game-card:hover .game-cover img {
  transform: scale(1.05);
}

.game-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.game-status.private {
  background-color: #f56c6c;
}

.game-status.unapproved {
  background-color: #e6a23c;
}

.game-status.approved {
  background-color: #67c23a;
}

.game-status.rejected {
  background-color: #909399;
}

.game-info {
  padding: 16px;
}

.game-title {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.game-description {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 0.9rem;
  line-height: 1.5;
  height: 42px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.game-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 15px;
}

.game-actions {
  display: flex;
  justify-content: space-between;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .index-container {
    padding: 10px;
  }

  .search-section {
    padding: 15px;
  }

  .games-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
