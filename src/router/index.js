import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
    {
        path: '/',
        redirect: (to) => {
            const authStore = useAuthStore()
            return authStore.isAuthenticated ? '/index' : '/login'
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Auth/Login.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/index',
        name: 'IndexPage',
        component: () => import('@/views/IndexPage/TopNavigationBar.vue'),
        meta: { requiresAuth: true }  // 修改为需要认证
    },
    // 捕获所有未匹配的路由
    {
        path: '/:pathMatch(.*)*',
        redirect: (to) => {
            const authStore = useAuthStore()
            return authStore.isAuthenticated ? '/index' : '/login'
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // 只需要检查认证状态
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next('/login')
    }

    next()
})

export default router
