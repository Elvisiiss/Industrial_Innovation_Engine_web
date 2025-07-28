import request from '@/utils/request'

export default {
    // 获取日志
    getLogs(params = {}) {
        return request.get('/logs', { params })
    },

    // 导出日志
    exportLogs(format = 'csv') {
        return request.get('/logs/export', {
            params: { format },
            responseType: 'blob'
        })
    }
}
