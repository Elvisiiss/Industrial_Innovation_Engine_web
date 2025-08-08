<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="logo">产业创意引擎IIE</div>
      <div class="nav-menu">
        <a @click="navigateTo('index')">首页</a>
        <a @click="navigateTo('my-games')">我的游戏</a>
        <a @click="navigateTo('upload')">上传游戏</a>
        <a v-if="userRole === '教师' || userRole === '管理员'" @click="navigateTo('review')">待审核</a>
        <a v-if="userRole === '管理员'" @click="navigateTo('users')">用户管理</a>
        <a v-if="userRole === '管理员'" @click="navigateTo('logs')">系统日志</a>
      </div>
      <div class="user-info">
        <el-dropdown>
          <span class="user-dropdown">
            <el-avatar :size="30" :src="userAvatar" />
            <span>{{ userName }}</span>
            <el-icon><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="viewProfile">个人中心</el-dropdown-item>
              <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <component :is="currentPageComponent" />
    </div>

    <!-- 游戏统计面板 -->
    <div v-if="showStats" class="stats-panel">
      <div class="stat-item">
        <div class="stat-value">{{ stats.totalGamesNumber || 0 }}</div>
        <div class="stat-label">总游戏数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.publicGamesNumber || 0 }}</div>
        <div class="stat-label">公开游戏</div>
      </div>
      <div class="stat-item">
        <div class="today-visits">
          <div class="visit-value">
            <span class="visit-number">{{ stats.todayGamesViewNumber || 0 }}</span>
            <span class="visit-label">总访问</span>
          </div>
          <div class="visit-divider">/</div>
          <div class="visit-value">
            <span class="visit-number">{{ stats.todayGamesWithoutMeViewNumber || 0 }}</span>
            <span class="visit-label">他人访问</span>
          </div>
        </div>
        <div class="stat-label">今日访问</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ArrowDown } from '@element-plus/icons-vue'
import MyGames from './MyGames.vue'
import UploadGame from './UploadGame.vue'
import ReviewGames from './ReviewGames.vue'
import UserManagement from './UserManagement.vue'
import OperationLogs from './OperationLogs.vue'
import Unauthorized from './Unauthorized.vue'
import gameApi from '@/api/game'  // 导入游戏API

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const stats = ref({
  totalGamesNumber: 0,
  publicGamesNumber: 0,
  todayGamesWithoutMeViewNumber: 0,
  todayGamesViewNumber: 0
})

const showStats = ref(true)
const currentPage = ref(route.query.page || 'index')

// 页面组件映射
const pageComponents = {
  'index': { component: MyGames, roles: ['学生', '教师', '管理员'] },
  'my-games': { component: MyGames, roles: ['学生', '教师', '管理员'] },
  'upload': { component: UploadGame, roles: ['学生', '教师', '管理员'] },
  'review': { component: ReviewGames, roles: ['教师', '管理员'] },
  'users': { component: UserManagement, roles: ['管理员'] },
  'logs': { component: OperationLogs, roles: ['管理员'] }
}

// 计算属性
const userName = computed(() => authStore.user?.name || '')
const userRole = computed(() => authStore.user?.role || '学生')
const userAvatar = computed(() => {
  const roles = {
    '管理员': '/avatars/admin.png',
    '教师': '/avatars/teacher.png',
    '学生': '/avatars/student.png'
  }
  return roles[userRole.value] || '/avatars/default.png'
})

// 当前页面组件
const currentPageComponent = computed(() => {
  const pageConfig = pageComponents[currentPage.value] || pageComponents['index']

  // 检查权限
  if (pageConfig.roles && !pageConfig.roles.includes(userRole.value)) {
    return Unauthorized
  }

  return pageConfig.component
})

// 导航方法
const navigateTo = (page) => {
  currentPage.value = page
  router.replace({ query: { page } })
}

// 获取统计信息
const fetchStats = async () => {
  try {
    // 使用封装后的API
    const response = await gameApi.getStats()
    stats.value = response.data.data
  } catch (error) {
    console.error('获取统计信息失败', error)
  }
}

// 查看个人资料
const viewProfile = () => {
  router.push('/profile')
}

// 退出登录
const logout = () => {
  authStore.clearUser()
  router.push('/login')
}

// 监听路由变化
watch(() => route.query.page, (newPage) => {
  if (newPage) {
    currentPage.value = newPage
  }
})

onMounted(() => {
  fetchStats()

  // 初始页面设置
  if (!route.query.page) {
    navigateTo('index')
  }
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background: linear-gradient(135deg, #2c3e50 0%, #1a2530 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(to right, #42b983, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-menu a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-menu a:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-menu a.router-link-exact-active {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: white;
  font-weight: 500;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

.stats-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 15px;
  background: white;
  border-radius: 12px;
  padding: 15px 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.stat-item {
  text-align: center;
  padding: 0 15px;
  position: relative;
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 40px;
  width: 1px;
  background: #eee;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #3498db;
}

.stat-label {
  font-size: 13px;
  color: #7f8c8d;
  margin-top: 4px;
}

.today-visits {
  display: flex;
  align-items: center;
  gap: 5px;
}

.visit-value {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.visit-number {
  font-size: 20px;
  font-weight: 700;
  color: #3498db;
}

.visit-label {
  font-size: 10px;
  color: #95a5a6;
}

.visit-divider {
  color: #bdc3c7;
  font-size: 18px;
  margin: 0 2px;
}
</style>
