<template>
  <div class="login-page">
    <div class="branding-section">
      <div class="branding-content">
        <img src="../logo/honglogo.png" alt="HongLongLen Logo" class="app-logo" />
      </div>
    </div>
    <div class="form-section">
      <div class="form-wrapper">
        <h2 class="form-title">ยินดีต้อนรับ</h2>
        <p class="form-description">กรุณากรอกข้อมูลเข้าสู่ระบบ!</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="loginName" class="form-label">อีเมล หรือ ชื่อผู้ใช้</label>
            <input
              id="loginName"
              type="text"
              class="form-input"
              placeholder="กรอกอีเมลหรือชื่อผู้ใช้ของคุณ"
              v-model="loginName"
              required
            />
          </div>
          <div class="form-group">
            <label for="password" class="form-label">รหัสผ่าน</label>
            <input
              id="password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              v-model="password"
              required
            />
          </div>
          <button type="submit" class="login-button">เข้าสู่ระบบ</button>
        </form>

        <div class="links-section">
          <span
            >ยังไม่มีบัญชี?
            <router-link to="/regist" class="form-link bold">ลงทะเบียน</router-link>
          </span>
        </div>
      </div>
    </div>
  </div>
  <ToastNotification />
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { showToast } from '../services/toastService'

axios.defaults.withCredentials = true

const loginName = ref('')
const password = ref('')
const router = useRouter()
const authStore = useAuthStore()

const API_BASE_URL = 'http://localhost:3000'

const handleLogin = async () => {
  try {
    const payload = { loginName: loginName.value, password: password.value }

    const response = await axios.post(`${API_BASE_URL}/members/login`, payload)

    if (response.data.login) {
      const user = response.data.user
      const token = response.data.token

      if (!token) {
        showToast('Login สำเร็จ แต่ไม่ได้รับ Token ยืนยันจาก Server', 'danger')
        return
      }

      authStore.login(user, token)

      showToast('เข้าสู่ระบบสำเร็จ!', 'success')

      if (user.dutyId === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else {
      showToast(response.data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'danger')
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
    showToast(errorMessage, 'danger')
    console.error('Login error:', error)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap');

.login-page {
  display: flex;
  width: 100vw;
  height: 89vh;
  font-family: 'Sarabun', sans-serif;
  overflow: hidden;
}

.branding-section {
  flex: 1.2;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  text-align: center;
  padding: 40px;
}

.branding-content {
  max-width: 500px;
}

.app-logo {
  width: 100%;
  height: auto;
}

.form-section {
  flex: 1.2;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
}

.form-description {
  font-size: 1rem;
  color: #777;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Sarabun', sans-serif;
  color: #333;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #efa40d;
  box-shadow: 0 0 0 3px rgba(255, 106, 136, 0.2);
  outline: none;
}

.login-button {
  width: 100%;
  padding: 12px 20px;
  background: #efa40d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  margin-top: 10px;
  box-shadow: 0 4px 15px rgba(255, 106, 136, 0.3);
}

.login-button:hover {
  background-color: #c08102;
  transform: translateY(-2px);
}

.links-section {
  margin-top: 25px;
  font-size: 0.9rem;
  text-align: center;
  color: #777;
}

.form-link {
  color: #efa40d;
  text-decoration: none;
  font-weight: 500;
}

.form-link:hover {
  text-decoration: underline;
}
.form-link.bold {
  font-weight: 700;
}

@media (max-width: 800px) {
  .login-page {
    flex-direction: column;
  }
  .branding-section {
    display: none;
  }
  .form-section {
    width: 100%;
    height: 100%;
  }
}
</style>
