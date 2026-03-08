<template>
  <div class="profile-page">
    <div v-if="loading" class="loading-spinner">
      <p>Loading profile...</p>
    </div>

    <div v-else-if="profileUser" class="profile-card">
      <img :src="profileImageUrl" alt="Profile Picture" class="profile-picture" />
      <h2 class="username">{{ profileUser.memName }}</h2>
      <p class="email">{{ profileUser.memEmail }}</p>
      <p class="role">Role ID: {{ profileUser.dutyId }}</p>

      <router-link to="/editprofile" class="edit-link">
        <button class="edit-btn">✏️ แก้ไขโปรไฟล์</button>
      </router-link>
    </div>

    <div v-else-if="error" class="error-message"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const user = ref(null)
const loading = ref(true)
const error = ref(null)
const authStore = useAuthStore()
const profileUser = computed(() => authStore.user)

onMounted(async () => {
  if (authStore.isAuthenticated) {
    loading.value = false
    return
  }

  try {
    const response = await axios.get('http://localhost:3000/members/detail', {
      withCredentials: true,
    })

    if (response.data.login) {
      authStore.login(response.data)
    } else {
      throw new Error(response.data.message || 'Authentication failed.')
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Could not fetch profile data.'
    console.error('Profile fetch error:', err)
  } finally {
    loading.value = false
  }
})

const profileImageUrl = computed(() => {
  if (profileUser.value && profileUser.value.memImgPath) {
    return `http://localhost:3000/img_mem/${profileUser.value.memImgPath}`
  }

  if (profileUser.value && profileUser.value.memEmail) {
    return `http://localhost:3000/img_mem/${profileUser.value.memEmail}.jpg`
  }

  return 'https://via.placeholder.com/150'
})
</script>

<style scoped>
.edit-link {
  text-decoration: none;
  margin-top: 1.5rem;
  display: block;
  padding: 0 1rem;
}

/* สไตล์สำหรับปุ่ม */
.edit-btn {
  background-color: #efa40d;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition:
    background-color 0.3s ease,
    transform 0.1s ease;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-btn:hover {
  background-color: #d8910c;
  transform: translateY(-1px);
}

.profile-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 89vh;
  padding: 2rem;
  background-color: #fff;
}

.profile-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
  padding-bottom: 3.5rem;
}

.profile-picture {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.5rem;
  border: 4px solid #efa40d;
}

.username {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #333;
}

.email {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
}

.role {
  font-size: 0.9rem;
  color: #888;
  background-color: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  display: inline-block;
}

.loading-spinner,
.error-message {
  text-align: center;
  color: #555;
}
.error-message h2 {
  color: #d9534f;
}
</style>
