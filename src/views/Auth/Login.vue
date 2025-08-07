<template>
  <div class="login-wrapper" :class="{ 'portrait-mode': isPortrait }">
    <div class="login-bg" v-if="isPortrait"></div>
    <div class="login-bg_h" v-else></div>
    <div class="login-container">
      <div class="login-header">
        <h1>产业创意引擎IIE</h1>
        <p>欢迎回来，请登录您的账号</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label>登录方式</label>
          <input
              type="text"
              class="form-control"
              value="学号登录"
              readonly
              disabled
          >
        </div>

        <div class="form-group">
          <label>学号</label>
          <input v-model="account" type="text" class="form-control" placeholder="请输入学号 3122230220" required>
        </div>

        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" class="form-control" placeholder="请输入密码 Huawei@123" required>
        </div>

        <button type="submit" class="submit-btn">
          <span v-if="!isLoading">登录</span>
          <span v-else class="loading-spinner"></span>
        </button>

        <div v-if="errorMessage" class="error-message">
          <i class="error-icon"></i>
          <span>{{ errorMessage }}</span>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import {onMounted, onUnmounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import authApi from '@/api/auth'
import {ElMessage} from "element-plus";

const account = ref('3122230220')
const password = ref('Huawei@123')
const errorMessage = ref('')
const isLoading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

// 添加屏幕方向检测
const isPortrait = ref(false)

const checkOrientation = () => {
  // 判断宽高比，小于1表示竖屏（手机端）
  isPortrait.value = window.innerWidth <= window.innerHeight
}

onMounted(() => {
  checkOrientation()
  window.addEventListener('resize', checkOrientation)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkOrientation)
})

const handleSubmit = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await authApi.loginWithPassword({
      user_number: account.value,
      passwd: password.value
    })
    if(response.data.code==='Success'){
      ElMessage.success(response.data.msg)
      authStore.setUser(
          response.data.data.id,
          response.data.data.mail,
          response.data.data.token,
          response.data.data.userName,
          response.data.data.userNickName,
          response.data.data.userNumber,
          response.data.data.userRole,
      )
      await router.push('/index')
    }else if(response.data.code==='Error'){
      ElMessage.error(response.data.msg)
    }else{
      alert(response.data.msg)
    }



  } catch (error) {
    errorMessage.value = error.response?.data?.msg || '登录失败，请检查您的账号和密码'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  position: relative;
}

.login-wrapper.portrait-mode {
  background: transparent;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/login_background_perpendicular.jpg');
  background-size: cover;
  background-position: center;
  filter: blur(10px);
  z-index: 0;
}

.login-bg_h {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/login_background_horizontal.jpg');
  background-size: cover;
  background-position: center;
  filter: blur(10px);
  z-index: 0;
}

.login-container {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  padding: 40px;
  animation: fadeIn 0.5s ease;
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.login-header p {
  color: #7f8c8d;
  font-size: 14px;
}

.login-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #34495e;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-control:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-control:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
}

.submit-btn:hover {
  background: #2980b9;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.footer-link {
  color: #7f8c8d;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #3498db;
}

.error-message {
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding: 12px;
  background: #fdecea;
  border-radius: 8px;
  color: #d32f2f;
  font-size: 14px;
}

.error-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23d32f2f"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>') no-repeat center;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 30px 20px;
  }
}

/* 竖屏模式下容器背景半透明 */
.login-wrapper.portrait-mode .login-container {
  background: rgba(255, 255, 255, 0.85);
}
</style>
