import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const isAuthenticated = ref(false)

    function setUser(id,mail,token,userName,userNickName,userNumber,userRole) {
        user.value = {
            user_id: id,
            e_mail: mail,
            token: token,
            name: userName,
            nick_name: userNickName,
            user_number: userNumber,
            role: userRole
        }
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(user.value))
    }

    function clearUser() {
        user.value = null
        isAuthenticated.value = false
        localStorage.removeItem('user')
    }

    function loadUserFromStorage() {
        const userData = localStorage.getItem('user')
        if (userData) {
            user.value = JSON.parse(userData)
            isAuthenticated.value = true
        }
    }

    return {
        user,
        isAuthenticated,
        setUser,
        clearUser,
        loadUserFromStorage,
    }
})
