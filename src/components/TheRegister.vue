<template>
  <div class="register-page">
    <div class="register-card">
      <img src="../logo/honglogo.png" alt="HongShop Logo" class="card-logo" />

      <h2 class="card-title">สร้างบัญชีผู้ใช้</h2>
      <p class="card-description">เป็นสมาชิก HongShop ได้ง่ายๆ</p>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username" class="form-label">ชื่อผู้ใช้ (Username)</label>
          <input
            id="username"
            type="text"
            class="form-input"
            placeholder="ตั้งชื่อผู้ใช้ของคุณ"
            v-model="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="email" class="form-label">อีเมล</label>
          <input
            id="email"
            type="email"
            class="form-input"
            placeholder="กรอกอีเมลของคุณ"
            v-model="email"
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

        <button type="submit" class="register-button">สมัครสมาชิก</button>
      </form>

      <div class="login-link-section">
        <span
          >มีบัญชีอยู่แล้ว?
          <router-link to="/login" class="form-link">เข้าสู่ระบบ</router-link></span
        >
      </div>
    </div>
  </div>
  <ToastNotification />
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import ToastNotification from '../components/ToastNotification.vue'
import { showToast } from '../services/toastService'

const username = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()

const handleRegister = async () => {
  if (!username.value || !email.value || !password.value) {
    showToast('กรุณากรอกข้อมูลให้ครบทุกช่อง', 'danger')
    return
  }

  try {
    const payload = {
      memName: username.value,
      memEmail: email.value,
      password: password.value,
    }

    const response = await axios.post('http://localhost:3000/members/register', payload)

    if (response.data.regist) {
      showToast('สมัครสมาชิกสำเร็จแล้ว!', 'success')
      router.push('/login')
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      showToast(error.response.data.message, 'danger')
    } else {
      showToast('เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง', 'danger')
      console.error('Registration error:', error)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap');

.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 92.2vh;
  width: 100vw;
  background-color: #fff;
  font-family: 'Sarabun', sans-serif;
  padding: 20px;
  box-sizing: border-box;
}

.register-card {
  width: 100%;
  max-width: 500px;
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.card-logo {
  height: 200px;
  width: auto;
  margin-bottom: 20px;
}

.card-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.card-description {
  font-size: 1rem;
  color: #777;
  margin-bottom: 30px;
}

.register-form .form-group {
  margin-bottom: 25px;
  text-align: left;
}

.form-label {
  display: none;
}

.form-input {
  width: 100%;
  padding: 12px 5px;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 0;
  font-size: 1rem;
  font-family: 'Sarabun', sans-serif;
  color: #333;
  background-color: transparent;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #efa40d;
  box-shadow: none;
  outline: none;
}

.register-button {
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
  box-shadow: none; /* นำเงาออก */
}

.register-button:hover {
  background-color: #c08102;
  transform: translateY(-2px);
}

.login-link-section {
  margin-top: 25px;
  font-size: 0.9rem;
  color: #777;
}

.form-link {
  color: #efa40d;
  text-decoration: none;
  font-weight: 600;
}

.form-link:hover {
  text-decoration: underline;
}
</style>
