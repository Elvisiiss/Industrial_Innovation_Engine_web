import request from '@/utils/request'

export default {
    // 获取用户列表
    getUsers() {
        return request.get('/users')
    },

    // 创建新用户
    createUser(userData) {
        return request.post('/users', userData)
    },

    // 更新用户信息
    updateUser(userId, userData) {
        return request.put(`/users/${userId}`, userData)
    },

    // 删除用户
    deleteUser(userId) {
        return request.delete(`/users/${userId}`)
    },

    // 更改用户状态
    changeUserStatus(userId, status) {
        return request.patch(`/users/${userId}/status`, { status })
    },

    // 搜索用户
    searchUsers(keyword) {
        return request.get('/users/search', { params: { keyword } })
    }
}
