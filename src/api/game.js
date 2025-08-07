import request from '@/utils/request'

export default {
    // 获取用户游戏列表
    getUserGames(userId) {
        return request.get(`/games/user/${userId}`)
    },

    // 创建新游戏
    createGame(gameData) {
        return request.post('/games', gameData)
    },

    // 更新游戏
    updateGame(gameId, gameData) {
        return request.put(`/games/${gameId}`, gameData)
    },

    // 删除游戏
    deleteGame(gameId) {
        return request.delete(`/games/${gameId}`)
    },

    // 更改游戏状态
    changeGameStatus(gameId, status) {
        return request.patch(`/games/${gameId}/status`, { status })
    },

    // 获取待审核游戏
    getPendingGames() {
        return request.get('/games/pending')
    },

    // 审核游戏
    reviewGame(gameId, action, reason = '') {
        return request.post(`/games/${gameId}/review`, { action, reason })
    },

    // 获取审核历史
    getReviewedGames() {
        return request.get('/games/reviewed')
    },

    // 搜索游戏
    searchGames(keyword) {
        return request.get('/games/search', { params: { keyword } })
    },

    // 新增：获取游戏统计信息
    getStats() {
        return request.get('/games/stats')
    }
}
