import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useCartStore } from './cartStore'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  watch(user, (newUser, oldUser) => {
    const cartStore = useCartStore()
    if (newUser && !oldUser) {
      cartStore.loadCartsForCurrentUser()
    } else if (!newUser && oldUser) {
      cartStore.clearCartOnLogout()
    }
  })

  const isAuthenticated = computed(() => !!user.value)
  const username = computed(() => user.value?.memName || '')

  const isAdmin = computed(() => {
    return user.value?.dutyId === 'admin'
  })

  const getToken = () => {
    return localStorage.getItem('token')
  }

  const updateProfile = (data) => {
    if (user.value) {
      let updated = false

      if (data.memName) {
        user.value.memName = data.memName
        updated = true
      }
      if (data.memImgPath) {
        user.value.memImgPath = data.memImgPath
        updated = true
      }
      if (updated) {
        localStorage.setItem('user', JSON.stringify(user.value))
      }
    }
  }

  function login(userData, tokenData) {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))

    if (tokenData) {
      localStorage.setItem('token', tokenData)
    }
  }

  function logout() {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    user.value = null
  }

  function checkAuthStatus() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      user.value = userData
    }
  }

  return {
    user,
    isAuthenticated,
    username,
    isAdmin,
    login,
    logout,
    checkAuthStatus,
    updateProfile,
    getToken,
  }
})
