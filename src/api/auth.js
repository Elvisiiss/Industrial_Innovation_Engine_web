import request from '@/utils/request'

export default {
    // 学号密码登录
    loginWithPassword(data) {
        return request.post('/auth/login/password', {
            msg: "登录学号密码",
            user_number: data.user_number,
            passwd: data.passwd
        })
    },
}
