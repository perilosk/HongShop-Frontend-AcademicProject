<template>
  <div class="edit-profile-page">
    <div class="edit-card">
      <h2>แก้ไขโปรไฟล์</h2>
      <p class="info-text">
        คุณสามารถเลือกแก้ไขข้อมูลใดก็ได้ (ชื่อ, รหัสผ่าน, รูปภาพ) หรือแก้ไขทั้งหมด
      </p>

      <form @submit.prevent="submitProfileUpdate" class="edit-form">
        <div class="form-group">
          <label for="memName">ชื่อผู้ใช้ใหม่:</label>
          <input
            id="memName"
            v-model="memName"
            type="text"
            placeholder="ใส่ชื่อใหม่ (ถ้าต้องการแก้ไข)"
          />
        </div>

        <div class="form-group">
          <label for="password">รหัสผ่านใหม่:</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="ใส่รหัสผ่านใหม่ (ถ้าต้องการแก้ไข)"
          />
          <p class="hint">เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน</p>
        </div>

        <div class="form-group">
          <label for="profileImage">รูปโปรไฟล์ใหม่:</label>
          <input id="profileImage" type="file" @change="handleFileUpload" accept="image/*" />
          <p v-if="fileName" class="file-status">ไฟล์ที่เลือก: {{ fileName }}</p>
        </div>

        <button type="submit" :disabled="isSubmitting" class="submit-btn">
          {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}
        </button>

        <div v-if="message" :class="['message', messageType]">{{ message }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const memName = ref('')
const password = ref('')
const file = ref(null)
const fileName = ref('')
const isSubmitting = ref(false)
const message = ref('')
const messageType = ref('')

const handleFileUpload = (event) => {
  file.value = event.target.files[0]
  fileName.value = file.value ? file.value.name : ''
}

const submitProfileUpdate = async () => {
  message.value = ''
  isSubmitting.value = true

  const formData = new FormData()

  if (memName.value.trim() !== '') {
    formData.append('memName', memName.value.trim())
  }
  if (password.value.trim() !== '') {
    formData.append('password', password.value.trim())
  }
  if (file.value) {
    formData.append('file', file.value)
  }

  if (Array.from(formData.keys()).length === 0) {
    message.value = 'กรุณาใส่ชื่อ, รหัสผ่าน, หรือเลือกรูปภาพอย่างน้อยหนึ่งอย่างเพื่อทำการแก้ไข'
    messageType.value = 'error'
    isSubmitting.value = false
    return
  }

  try {
    const response = await axios.put('http://localhost:3000/members/profile', formData, {
      withCredentials: true,
    })

    message.value = response.data.message || 'บันทึกข้อมูลสำเร็จ!'
    messageType.value = 'success'

    const updatedData = {}

    if (memName.value.trim() !== '') {
      updatedData.memName = memName.value.trim()
    }

    if (response.data.newImagePath) {
      updatedData.memImgPath = response.data.newImagePath
    }

    if (Object.keys(updatedData).length > 0) {
      // 🚀 ส่วนสำคัญ: อัปเดต Pinia Store ทันที
      authStore.updateProfile(updatedData)
    }

    memName.value = ''
    password.value = ''
    file.value = null
    fileName.value = ''

    setTimeout(() => {
      router.push('/profile')
    }, 1500)
  } catch (error) {
    const errMsg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์'
    message.value = errMsg
    messageType.value = 'error'
    console.error('Update failed:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.edit-profile-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
  background-color: #f4f6f8;
}

.edit-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

h2 {
  color: #333;
  text-align: center;
  margin-bottom: 1.5rem;
}

.info-text {
  text-align: center;
  color: #888;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed #eee;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #555;
}

.form-group input[type='text'],
.form-group input[type='password'] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #007bff;
  outline: none;
}

.hint {
  font-size: 0.85rem;
  color: #a0a0a0;
  margin-top: 5px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #efa40d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: 600;
}

.submit-btn:hover:not(:disabled) {
  background-color: #d8910c;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.message {
  padding: 10px;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
  font-weight: bold;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.file-status {
  margin-top: 10px;
  font-size: 0.9em;
  color: #007bff;
}
</style>
