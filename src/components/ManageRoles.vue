<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4 text-primary">👥 แก้ไขบทบาทสมาชิก (Manage Roles)</h2>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else class="card shadow-sm">
      <div class="card-body">
        <h5 class="card-title mb-3">รายชื่อสมาชิก</h5>
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th scope="col">อีเมล (memEmail)</th>
                <th scope="col">ชื่อผู้ใช้</th>
                <th scope="col" class="text-center">บทบาทปัจจุบัน</th>
                <th scope="col" class="text-center">เปลี่ยนบทบาทเป็น</th>
                <th scope="col" class="text-center">บันทึก</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in members" :key="member.memEmail">
                <td>{{ member.memEmail }}</td>
                <td>{{ member.memName }}</td>
                <td class="text-center">
                  <span
                    :class="['badge', member.dutyId === 'admin' ? 'bg-danger' : 'bg-secondary']"
                  >
                    {{ member.dutyId }}
                  </span>
                </td>
                <td style="width: 200px">
                  <select
                    class="form-select form-select-sm"
                    v-model="member.selectedRole"
                    :disabled="member.memEmail === currentUserEmail"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </td>
                <td class="text-center">
                  <button
                    class="btn btn-primary btn-sm"
                    @click="handleSaveRole(member)"
                    :disabled="member.memEmail === currentUserEmail"
                  >
                    บันทึก
                  </button>
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
import { ref, onMounted, computed } from 'vue'
import apiClient from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { showToast } from '../services/toastService'

const members = ref([])
const loading = ref(true)
const error = ref(null)
const authStore = useAuthStore()

const currentUserEmail = computed(() => authStore.user?.memEmail || '')

const fetchMembers = async () => {
  loading.value = true
  error.value = null
  try {
    const token = authStore.getToken()
    if (!token) throw new Error('Authentication Token not found')

    const response = await apiClient.get('/members', {
      headers: { Authorization: `Bearer ${token}` },
    })

    members.value = response.data.map((member) => ({
      ...member,
      selectedRole: member.dutyId,
    }))
  } catch (err) {
    console.error('Failed to fetch members:', err)
    error.value = err.response?.data?.message || err.message || 'Could not fetch members'
    showToast(error.value, 'danger')
  } finally {
    loading.value = false
  }
}

onMounted(fetchMembers)

const handleSaveRole = async (member) => {
  if (member.selectedRole === member.dutyId) {
    showToast('ไม่มีการเปลี่ยนแปลง', 'info', 1500)
    return
  }

  if (
    window.confirm(
      `คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนบทบาทของ ${member.memName} เป็น ${member.selectedRole}?`,
    )
  ) {
    try {
      const token = authStore.getToken()
      if (!token) throw new Error('Authentication Token not found')

      const payload = {
        memEmail: member.memEmail,
        dutyId: member.selectedRole,
      }

      const response = await apiClient.put('/members/role', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      member.dutyId = member.selectedRole
      showToast(response.data.message || 'อัปเดตบทบาทสำเร็จ!', 'success')
    } catch (err) {
      console.error('Failed to update role:', err)

      member.selectedRole = member.dutyId
      showToast(err.response?.data?.message || 'อัปเดตล้มเหลว', 'danger')
    }
  }
}
</script>

<style scoped>
.table-responsive {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
