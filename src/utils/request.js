// src/utils/request.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

// 创建axios实例
const request = axios.create({
    baseURL: '/api', // 使用代理后的基础路径
    timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 排除登录接口
        if (!config.url?.includes('/auth/login/password')) {
            // 从本地存储获取token
            const token = authStore.user?.token
            if (token) {
                // 添加认证头
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default request
