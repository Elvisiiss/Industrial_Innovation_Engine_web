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
    },
    {
        path: '/my-games',
        name: 'MyGames',
        component: () => import('@/views/IndexPage/MyGames.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/upload',
        name: 'UploadGame',
        component: () => import('@/views/IndexPage/UploadGame.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/review',
        name: 'ReviewGames',
        component: () => import('@/views/IndexPage/ReviewGames.vue'),
        meta: {
            requiresAuth: true,
            roles: ['教师', '管理员']
        }
    },
    {
        path: '/users',
        name: 'UserManagement',
        component: () => import('@/views/IndexPage/UserManagement.vue'),
        meta: {
            requiresAuth: true,
            roles: ['管理员']
        }
    },
    {
        path: '/logs',
        name: 'OperationLogs',
        component: () => import('@/views/IndexPage/OperationLogs.vue'),
        meta: {
            requiresAuth: true,
            roles: ['教师', '管理员']
        }
    },
    {
        path: '/unauthorized',
        name: 'Unauthorized',
        component: () => import('@/views/IndexPage/Unauthorized.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const userRole = authStore.user?.role || '学生'

    // 需要认证的路由
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next('/login')
    }

    // 权限检查
    if (to.meta.roles) {
        if (!to.meta.roles.includes(userRole)) {
            return next('/unauthorized')
        }
    }

    next()
})

export default router
