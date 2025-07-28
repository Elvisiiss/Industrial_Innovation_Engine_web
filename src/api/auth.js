import axios from 'axios'

const API_BASE_URL = 'http://localhost:5174/api/auth'

export default {
    // 学号密码登录
    loginWithPassword(data) {
        return axios.post(`${API_BASE_URL}/login/password`, {
            msg: "登录学号密码",
            user_number: data.user_number,
            passwd: data.passwd
        })
    },
}
