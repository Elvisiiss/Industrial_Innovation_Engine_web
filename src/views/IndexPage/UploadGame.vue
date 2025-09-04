<template>
  <div class="upload-container">
    <h2>{{ isEditing ? '编辑游戏' : '上传新游戏' }}</h2>

    <el-form :model="gameForm" label-width="120px" class="game-form">
      <el-form-item label="游戏名称" required>
        <el-input v-model="gameForm.gameName" placeholder="请输入游戏名称"/>
      </el-form-item>

      <el-form-item label="游戏链接" required>
        <el-input v-model="gameForm.gameUrl" placeholder="https://"/>
      </el-form-item>

      <el-form-item label="游戏描述">
        <el-input
            v-model="gameForm.gameDescription"
            type="textarea"
            :rows="4"
            placeholder="请输入游戏描述"
        />
      </el-form-item>

      <el-form-item label="游戏封面">
        <el-upload
            list-type="picture-card"
            :http-request="handleCoverUpload"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
            :limit="1"
            :on-exceed="handleExceed"
            :file-list="coverFileList"
            :on-remove="handleCoverRemove"
        >
          <el-icon>
            <Plus/>
          </el-icon>
          <template #file="{ file }">
            <div class="cover-preview">
              <img :src="file.url" alt="游戏封面" class="cover-image"/>
              <span class="cover-actions">
                <span class="cover-delete" @click.stop="removeCover">
                  <el-icon><Delete /></el-icon>
                </span>
              </span>
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <!-- 标签区域 -->
      <el-form-item label="游戏标签">
        <div class="tag-controls">
          <el-button type="primary" @click="showCreateTagDialog" size="small">
            创建新标签
          </el-button>
        </div>

        <!-- 可用标签区域 -->
        <div class="tag-section">
          <div class="section-title">可用标签</div>
          <div class="tags-container">
            <el-tag
                v-for="tag in availableTags"
                :key="tag.id || `avail_${tag.tagName}`"
                class="tag-item"
                :class="{ 'tag-selected': isTagSelected(tag) }"
                @click="toggleTag(tag)"
            >
              <el-tooltip :content="tag.tagDescription || '无描述信息'" placement="top">
                <span>{{ tag.tagName }}</span>
              </el-tooltip>
            </el-tag>
          </div>
        </div>

        <!-- 已选标签区域 -->
        <div class="tag-section">
          <div class="section-title">已选标签</div>
          <div class="tags-container">
            <el-tag
                v-for="tag in gameForm.tags"
                :key="tag.id || `selected_${tag.tagName}`"
                class="tag-item tag-selected"
                closable
                @close="removeTag(tag)"
            >
              <el-tooltip :content="tag.tagDescription || '无描述信息'" placement="top">
                <span>{{ tag.tagName }}</span>
              </el-tooltip>
            </el-tag>
            <div v-if="!gameForm.tags.length" class="empty-tags-hint">暂无已选标签</div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="发布状态">
        <el-radio-group v-model="gameForm.status">
          <el-radio label="私有">仅自己可见</el-radio>
          <el-radio label="发布">公开（需要审核）</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitGame">{{ isEditing ? '更新' : '提交' }}</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 创建标签对话框 -->
    <el-dialog
        v-model="createTagDialogVisible"
        title="创建新标签"
        width="500px"
        center
    >
      <el-form :model="newTagForm" label-width="80px">
        <el-form-item label="标签名" required>
          <el-input v-model="newTagForm.tagName" placeholder="请输入标签名称"/>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
              v-model="newTagForm.tagDescription"
              type="textarea"
              :rows="3"
              placeholder="请输入标签描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createTagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreateTag">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import gameApi from '@/api/game'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const availableTags = ref([])
const coverFileList = ref([])
const isEditing = computed(() => !!route.query.gameId) // 判断是否为编辑模式

// 获取标签数据
const fetchTags = async () => {
  try {
    const response = await gameApi.getAllMyTags()
    if (response.data.code === 'Success') {
      availableTags.value = response.data.data
    } else {
      ElMessage.error('获取标签失败: ' + response.msg)
    }
  } catch (error) {
    ElMessage.error('获取标签失败: ' + error.message)
  }
}

// 获取游戏详情（编辑模式）
const fetchGameDetail = async (gameId) => {
  try {
    const response = await gameApi.getGameById(gameId)
    if (response.data.code === 'Success') {
      const game = response.data.data
      // 填充表单数据
      gameForm.value = {
        gameName: game.gameName,
        gameUrl: game.gameUrl,
        gameDescription: game.gameDescription,
        gamePicture: game.gamePicture || '',
        tags: game.tags || [],
        status: game.status === 'PRIVATE' ? '私有' : '发布'
      }

      // 处理封面图片，修复图片显示问题
      if (game.gamePicture) {
        // 判断URL是否已包含完整路径
        const isFullUrl = game.gamePicture.startsWith('http') || game.gamePicture.startsWith('/api')
        const imageUrl = isFullUrl ? game.gamePicture : game.gamePicture

        coverFileList.value = [{
          name: 'cover',
          url: imageUrl
        }]
      }
    } else {
      ElMessage.error('获取游戏详情失败: ' + response.data.msg)
      router.push('/my-games') // 获取失败跳回我的游戏
    }
  } catch (error) {
    ElMessage.error('获取游戏详情失败: ' + error.message)
    router.push('/my-games')
  }
}

onMounted(async () => {
  await fetchTags()
  // 如果是编辑模式，获取游戏详情
  if (isEditing.value) {
    await fetchGameDetail(route.query.gameId)
  }
})

const gameForm = ref({
  gameName: '',
  gameUrl: '',
  gameDescription: '',
  gamePicture: '',
  tags: [],
  status: '私有'
})

// 创建标签相关
const createTagDialogVisible = ref(false)
const newTagForm = ref({
  tagName: '',
  tagDescription: ''
})

const showCreateTagDialog = () => {
  newTagForm.value = {tagName: '', tagDescription: ''}
  createTagDialogVisible.value = true
}

const confirmCreateTag = async () => {
  const {tagName, tagDescription} = newTagForm.value
  if (!tagName.trim()) {
    ElMessage.error('标签名称不能为空')
    return
  }

  // 检查是否已存在
  const exists = availableTags.value.some(tag =>
      tag.tagName.toLowerCase() === tagName.toLowerCase()
  )

  if (exists) {
    ElMessage.warning(`标签 "${tagName}" 已存在`)
    createTagDialogVisible.value = false
    return
  }

  // 创建新标签对象
  const newTag = {
    id: null,
    tagName,
    tagDescription: tagDescription || '无描述信息'
  }

  // 添加到可用标签
  availableTags.value.push(newTag)
  // 自动选中新标签
  toggleTag(newTag)

  ElMessage.success(`标签 "${tagName}" 创建成功`)
  createTagDialogVisible.value = false
}

// 标签选择功能
const isTagSelected = (tag) => {
  return gameForm.value.tags.some(t =>
      (t.id && t.id === tag.id) ||
      (!t.id && t.tagName === tag.tagName))
}

const toggleTag = (tag) => {
  if (isTagSelected(tag)) {
    removeTag(tag)
  } else {
    addTag(tag)
  }
}

const addTag = (tag) => {
  if (!isTagSelected(tag)) {
    gameForm.value.tags.push(tag)
  }
}

const removeTag = (tag) => {
  gameForm.value.tags = gameForm.value.tags.filter(t =>
      (t.id && t.id !== tag.id) ||
      (!t.id && t.tagName !== tag.tagName)
  )
}

// 封面图片上传相关
const handleExceed = () => {
  ElMessage.warning('只能上传一张封面图片')
}

// 处理封面移除事件
const handleCoverRemove = () => {
  removeCover()
}

const removeCover = () => {
  coverFileList.value = []
  gameForm.value.gamePicture = ''
}

const handleCoverUpload = async (options) => {
  try {
    const formData = new FormData()
    formData.append('pictureFile', options.file)

    const response = await gameApi.uploadGamePicture(formData)
    options.onSuccess(response)
  } catch (error) {
    options.onError(error)
    ElMessage.error('封面上传失败: ' + (error.response?.data?.message || error.message))
  }
}

const handleCoverSuccess = (response) => {
  if (response.data.code === 'Success') {
    const fileUrl = response.data.data
    gameForm.value.gamePicture = fileUrl
    // 确保只显示一张图片
    coverFileList.value = [{
      name: 'cover',
      url: fileUrl.startsWith('http') ? fileUrl : fileUrl
    }]
    ElMessage.success('封面图片上传成功')
  } else {
    ElMessage.error(response.data.msg || '封面上传失败')
  }
}

const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
  }

  return isImage && isLt2M
}

const submitGame = async () => {
  try {
    if (!gameForm.value.gameName.trim()) {
      ElMessage.error('游戏名称不能为空')
      return
    }

    if (!gameForm.value.gameUrl.trim()) {
      ElMessage.error('游戏链接不能为空')
      return
    }

    const tags = gameForm.value.tags.map(tag => ({
      id: tag.id,
      tagName: tag.tagName,
      tagDescription: tag.tagDescription
    }))

    const statusMap = {
      '私有': 'PRIVATE',
      '发布': 'UNAPPROVED'
    }

    const gameData = {
      gameName: gameForm.value.gameName,
      gameUrl: gameForm.value.gameUrl,
      gameDescription: gameForm.value.gameDescription,
      gamePicture: gameForm.value.gamePicture || '',
      tags: tags,
      status: statusMap[gameForm.value.status]
    }

    const token = authStore.token
    if (isEditing.value) {
      // 编辑模式 - 调用更新API
      await gameApi.updateGame(route.query.gameId, gameData, token)
      ElMessage.success('游戏更新成功！')
    } else {
      // 新增模式 - 调用创建API
      await gameApi.createGame(gameData, token)
      ElMessage.success('游戏提交成功！')
    }

    resetForm()
    router.push('/index?page=my-games') // 提交后返回我的游戏页面
  } catch (error) {
    ElMessage.error('操作失败: ' + (error.response?.data?.message || error.message))
  }
}

const resetForm = () => {
  gameForm.value = {
    gameName: '',
    gameUrl: '',
    gameDescription: '',
    gamePicture: '',
    tags: [],
    status: '私有'
  }
  coverFileList.value = []
}
</script>

<style scoped>
.upload-container {
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

.game-form {
  max-width: 800px;
  margin: 0 auto;
}

/* 标签区域样式 */
.tag-controls {
  margin-bottom: 15px;
}

.tag-section {
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f9fafc;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 15px;
  color: #4e5969;
  margin-bottom: 12px;
  font-weight: 600;
  padding-left: 5px;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background-color: #409eff;
  border-radius: 2px;
  margin-right: 8px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 50px;
  padding: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background-color: #ffffff;
  transition: border-color 0.3s;
}

.tags-container:hover {
  border-color: #c9cdD4;
}

.tag-item {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  background-color: #f2f3f5;
  color: #4e5969;
  border: 1px solid transparent;
}

.tag-item:not(.tag-selected):hover {
  background-color: #e5e6eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.tag-selected {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #b3d8ff;
  font-weight: 500;
}

.tag-selected:hover {
  background-color: #d9ecff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.empty-tags-hint {
  color: #86909c;
  font-size: 13px;
  padding: 8px 10px;
  font-style: italic;
}

/* 标签关闭按钮样式 */
:deep(.el-tag__close) {
  margin-left: 6px;
  color: #409eff;
  opacity: 0.7;
}

:deep(.el-tag__close:hover) {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.2);
}

/* 封面图片样式 */
.cover-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  padding: 4px;
}

.cover-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cover-delete:hover {
  background-color: rgba(0, 0, 0, 0.7);
}
</style>
