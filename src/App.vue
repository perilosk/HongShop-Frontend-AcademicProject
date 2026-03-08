<template>
  <MainMenu></MainMenu>
  <router-view></router-view>
  <ToastNotification />
</template>

<script setup>
import MainMenu from './components/MainMenu.vue'
import ToastNotification from './components/ToastNotification.vue'
import { onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'

const authStore = useAuthStore()

onMounted(() => {
  authStore.checkAuthStatus()
})
</script>

<style></style>
