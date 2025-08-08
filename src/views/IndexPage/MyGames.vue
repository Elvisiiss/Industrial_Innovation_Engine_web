<template>
  <div class="my-games-container">
    <h2>我的游戏</h2>

    <div class="actions">
      <el-button type="primary" @click="showUploadDialog = true">
        <el-icon><Plus /></el-icon> 添加游戏
      </el-button>
    </div>

    <el-table :data="games" style="width: 100%">
      <el-table-column prop="gameName" label="游戏名称" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === '待审核' ? 'success' : 'info'">
            {{ row.status }}
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
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="editGame(row)">编辑</el-button>
          <el-button
              size="small"
              :type="row.status === '待审核' ? 'warning' : 'success'"
              @click="toggleGameStatus(row)"
          >
            {{ row.status === '待审核' ? '设为私有' : '发布' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 上传游戏对话框 -->
    <el-dialog v-model="showUploadDialog" title="添加游戏">
      <el-form :model="newGame" label-width="100px">
        <el-form-item label="游戏名称" required>
          <el-input v-model="newGame.gameName" />
        </el-form-item>
        <el-form-item label="游戏链接" required>
          <el-input v-model="newGame.gameUrl" placeholder="https://" />
        </el-form-item>
        <el-form-item label="游戏描述">
          <el-input v-model="newGame.gameDescription" type="textarea" rows="4" />
        </el-form-item>
        <el-form-item label="游戏标签">
          <el-select
              v-model="newGame.tags"
              multiple
              filterable
              allow-create
              placeholder="添加标签"
              style="width: 100%"
          >
            <el-option
                v-for="tag in availableTags"
                :key="tag"
                :label="tag"
                :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="addGame">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import gameApi from '@/api/game'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const games = ref([])
const availableTags = ref(['冒险', '益智', '教育', '科幻', '历史', '策略', '动作'])
const showUploadDialog = ref(false)
const newGame = ref({
  gameName: '',
  gameUrl: '',
  gameDescription: '',
  tags: [],
  status: 'PRIVATE' // 默认私有状态
})

// 获取用户游戏
const fetchGames = async () => {
  try {
    const response = await gameApi.getUserGames(authStore.user.user_id)
    if (response.data.code === 'Success') {
      games.value = response.data.data.map(game => ({
        ...game,
        status: game.status === 'UNAPPROVED' ? '待审核' : '私有'
      }))
    } else {
      ElMessage.error(response.data.msg || '获取游戏列表失败')
    }
  } catch (error) {
    ElMessage.error('获取游戏列表失败: ' + (error.response?.data?.message || error.message))
  }
}

// 添加游戏
const addGame = async () => {
  try {
    const gameData = {
      gameName: newGame.value.gameName,
      gameUrl: newGame.value.gameUrl,
      gameDescription: newGame.value.gameDescription,
      tags: newGame.value.tags,
      status: newGame.value.status
    }

    await gameApi.createGame(gameData)
    ElMessage.success('游戏添加成功!')
    showUploadDialog.value = false
    resetNewGame()
    fetchGames() // 刷新列表
  } catch (error) {
    ElMessage.error('添加游戏失败: ' + (error.response?.data?.message || error.message))
  }
}

// 切换游戏状态
const toggleGameStatus = async (game) => {
  try {
    const newStatus = game.status === '待审核' ? 'PRIVATE' : 'UNAPPROVED'
    await gameApi.changeGameStatus(game.id, newStatus, "-")
    ElMessage.success('游戏状态已更新')
    fetchGames() // 刷新列表
  } catch (error) {
    ElMessage.error('更新状态失败: ' + (error.response?.data?.message || error.message))
  }
}

// 编辑游戏
const editGame = (game) => {
  console.log('编辑游戏:', game)
  // 实际实现需要打开编辑对话框
}

const resetNewGame = () => {
  newGame.value = {
    gameName: '',
    gameUrl: '',
    gameDescription: '',
    tags: [],
    status: 'PRIVATE'
  }
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

.actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

h2 {
  margin-top: 0;
  color: #2c3e50;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
</style>
