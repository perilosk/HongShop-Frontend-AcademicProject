<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4 text-info">📑 ดูรายชื่อสมาชิกทั้งหมด (View All Members)</h2>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else class="card shadow-sm">
      <div class="card-body">
        <h5 class="card-title mb-3">สมาชิกทั้งหมดในระบบ ({{ members.length }} คน)</h5>

        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead class="table-light">
              <tr>
                <th scope="col">อีเมล (memEmail)</th>
                <th scope="col">ชื่อผู้ใช้</th>
                <th scope="col">บทบาท (Duty)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in members" :key="member.memEmail">
                <td>{{ member.memEmail }}</td>
                <td>{{ member.memName }}</td>
                <td>
                  <span
                    :class="['badge', member.dutyId === 'admin' ? 'bg-danger' : 'bg-secondary']"
                  >
                    {{ member.dutyId }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../services/api'
import { useAuthStore } from '../stores/authStore'

const members = ref([])
const loading = ref(true)
const error = ref(null)
const authStore = useAuthStore()

const fetchMembers = async () => {
  loading.value = true
  error.value = null
  try {
    const token = authStore.getToken()
    if (!token) throw new Error('Authentication Token not found')

    const response = await apiClient.get('/members', {
      headers: { Authorization: `Bearer ${token}` },
    })

    members.value = response.data
  } catch (err) {
    console.error('Failed to fetch members:', err)
    error.value = err.response?.data?.message || err.message || 'Could not fetch members'
  } finally {
    loading.value = false
  }
}

onMounted(fetchMembers)
</script>

<style scoped>
.table-responsive {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
