import request from '@/utils/request'

export default {
    //得到所有我的标签
    getAllMyTags(){
        return request.get(`/tool/getAllMyTags`)
    },

    //上传图片
    uploadGamePicture(pictureFile){
        return request.post(`/tool/uploadGamePicture`,pictureFile)
    },

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
    changeGameStatus(gameId, status, description) {
        return request.patch(`/games/${gameId}/status`, { status, description })
    },

    // 获取待审核游戏
    getPendingGames() {
        return request.get('/games/pending')
    },

    // 审核游戏
    reviewGame(gameId, status, examineDescription) {
        return request.post(`/games/${gameId}/review`, { status, examineDescription })
    },

    // 获取审核历史
    getReviewedGames() {
        return request.get('/games/reviewed')
    },

    // 搜索游戏
    searchGames(searchRequest) {
        return request.get('/games/search', {
            params: {
                myId: searchRequest.myId,
                keyword: searchRequest.keyword,
                wannaMe: searchRequest.wannaMe
            }
        })
    },

    // 新增：获取游戏统计信息
    getStats() {
        return request.get('/games/stats')
    },

    // 根据id来获取游戏
    getGameById(gameId) {
        return request.get(`/games/get/${gameId}`)
    },
}
