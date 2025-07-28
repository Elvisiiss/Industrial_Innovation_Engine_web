<template>
  <div class="upload-container">
    <h2>上传新游戏</h2>

    <el-form :model="gameForm" label-width="120px" class="game-form">
      <el-form-item label="游戏名称" required>
        <el-input v-model="gameForm.title" placeholder="请输入游戏名称" />
      </el-form-item>

      <el-form-item label="游戏链接" required>
        <el-input v-model="gameForm.url" placeholder="https://" />
      </el-form-item>

      <el-form-item label="游戏描述">
        <el-input
            v-model="gameForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入游戏描述"
        />
      </el-form-item>

      <el-form-item label="游戏封面">
        <el-upload
            action="/api/upload"
            list-type="picture-card"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="游戏标签">
        <el-select
            v-model="gameForm.tags"
            multiple
            filterable
            allow-create
            placeholder="请选择或创建标签"
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

      <el-form-item label="发布状态">
        <el-radio-group v-model="gameForm.status">
          <el-radio label="私有">仅自己可见</el-radio>
          <el-radio label="发布">公开（需要审核）</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitGame">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import gameApi from '@/api/game'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const availableTags = ref(['冒险', '益智', '教育', '科幻', '历史', '策略', '动作'])

const gameForm = ref({
  title: '',
  url: '',
  description: '',
  cover: '',
  tags: [],
  status: '私有'
})

const handleCoverSuccess = (response) => {
  gameForm.value.cover = response.url
  ElMessage.success('封面图片上传成功')
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
    const gameData = {
      title: gameForm.value.title,
      url: gameForm.value.url,
      description: gameForm.value.description,
      tags: gameForm.value.tags.join(','),
      cover_image: gameForm.value.cover,
      user_id: authStore.user.user_id,
      is_public: gameForm.value.status === '发布'
    }

    await gameApi.createGame(gameData)
    ElMessage.success('游戏提交成功！')
    resetForm()
  } catch (error) {
    ElMessage.error('提交失败: ' + (error.response?.data?.message || error.message))
  }
}

const resetForm = () => {
  gameForm.value = {
    title: '',
    url: '',
    description: '',
    cover: '',
    tags: [],
    status: '私有'
  }
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
</style>
