<template>
  <nav class="navbar navbar-expand-lg fixed-top main-navbar-combined">
    <div class="container main-content-row">
      <router-link to="/" class="navbar-brand">
        <img src="../logo/hongshop.png" alt="Logo" class="logo-img" />
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav me-auto main-menu-links">
          <li class="nav-item me-3">
            <router-link to="/" class="nav-link">หน้าแรก</router-link>
          </li>
          <li class="nav-item me-3">
            <router-link to="/product" class="nav-link">สินค้า</router-link>
          </li>
        </ul>
        <form class="w-50 mx-auto search-form-icon" role="search" @submit.prevent="handleSearch">
          <input
            class="form-control"
            type="search"
            placeholder="ค้นหาสินค้า"
            aria-label="Search"
            v-model="searchQuery"
          />
        </form>

        <ul class="navbar-nav ms-auto align-items-center flex-row">
          <template v-if="authStore.isAuthenticated">
            <li class="nav-item cart-icon-container">
              <router-link to="/cart" class="icon-link" aria-current="page">
                <i class="bi bi-cart-fill"></i>
                <span v-if="cartStore.totalCartCount > 0" class="cart-badge">
                  {{ cartStore.totalCartCount }}
                </span>
              </router-link>
            </li>

            <li class="nav-item nav-separator"></li>

            <li class="nav-item dropdown">
              <a
                href="#"
                class="icon-link dropdown-toggle"
                id="navbarDropdownMenu"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-person-fill"></i>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenu">
                <li>
                  <router-link to="/profile" class="dropdown-item"
                    >โปรไฟล์ ({{ authStore.username }})</router-link
                  >
                </li>
                <li>
                  <router-link to="/history" class="dropdown-item">ประวัติการสั่งซื้อ</router-link>
                </li>
                <li v-if="authStore.isAdmin || authStore.username === 'admin'">
                  <router-link to="/admin" class="dropdown-item manage-dropdown-item">
                    จัดการ
                  </router-link>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a class="dropdown-item" href="#" @click="handleLogout" style="cursor: pointer">
                    ออกจากระบบ
                  </a>
                </li>
              </ul>
            </li>
          </template>

          <template v-else>
            <li class="nav-item">
              <router-link to="/login" class="icon-link">
                <i class="bi bi-person-fill"></i>
              </router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import { useRouter } from 'vue-router'
import { showToast } from '../services/toastService'
import apiClient from '../services/api'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()
const searchQuery = ref('')

onMounted(() => {
  if (authStore.isAuthenticated) {
    cartStore.loadCartsForCurrentUser()
  }
})

watch(
  () => authStore.isAuthenticated,
  (newStatus) => {
    if (newStatus) {
      cartStore.loadCartsForCurrentUser()
    } else {
      cartStore.clearCartOnLogout()
    }
  },
  { immediate: true },
)
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/product?search=${searchQuery.value.trim()}`)
  } else {
    router.push('/product')
  }
}

const handleLogout = async () => {
  try {
    await apiClient.post('/members/logout')
    authStore.logout()
    showToast('ออกจากระบบสำเร็จ', 'success')
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
    showToast('เกิดข้อผิดพลาดในการออกจากระบบ', 'danger')
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style>
body {
  padding-top: 76px;
  background-color: #f0f0f0;
}

.main-navbar-combined {
  padding: 0;
}

.navbar-brand {
  padding-right: 1rem;
  margin-right: 1rem;
  border-right: 1px solid #e0e0e0;
}

.main-content-row {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: none;
  width: 100%;
  display: flex;
  align-items: center;
}

.main-menu-links {
  margin-right: auto !important;
  padding-left: 0.5rem;
}
.nav-separator {
  width: 1px;
  height: 24px;
  background-color: #ccc;
  margin: 0 15px;
}
.navbar {
  background: white;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  height: 100px;
}

.logo-img {
  height: 50px;
  width: auto;
}
.search-form-icon {
  position: relative;
}
.search-form-icon .form-control {
  border-radius: 50rem;
  padding-left: 2.5rem;
  border-color: #dee2e6;
  font-weight: 300;
  font-size: 0.95rem;
}
.search-form-icon .form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
.search-form-icon::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%236c757d'%3e%3cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  z-index: 3;
}
.navbar-nav .nav-item.dropdown .dropdown-toggle::after {
  display: none;
}
.icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 1.5rem;
  transition: color 0.2s ease-in-out;
}
.icon-link:hover {
  color: #212529;
}
.nav-separator {
  width: 1px;
  background-color: #e0e0e0;
  height: 24px;
  margin-left: 1rem;
  margin-right: 1rem;
}
.nav-link {
  font-weight: 400;
  color: rgba(0, 0, 0, 0.75);
}
.nav-link:hover {
  color: #000;
}
.manage-dropdown-item {
  color: inherit !important;
  font-weight: inherit;
}
.manage-dropdown-item:hover {
  background-color: #e9ecef;
}
.cart-icon-container {
  position: relative;
}
.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: bold;
  border: 2px solid white;
}
</style>
