<template>
  <div class="container my-5">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="product" class="row body-c">
      <div class="col-md-6">
        <img
          :src="getImageUrl(product.image)"
          :alt="product.pdName"
          @error="onImageError"
          class="img-fluid rounded shadow-sm product-detail-img"
        />
      </div>

      <div class="col-md-6">
        <h1 class="display-8 fw-bold">{{ product.pdName }}</h1>
        <p class="fs-4 text-danger fw-light">{{ formatCurrency(product.pdPrice) }}</p>

        <div class="fs-5 mt-4">
          <p class="mb-2"><strong>แบรนด์:</strong> {{ product.pdBrand || 'ไม่มีข้อมูล' }}</p>
          <p><strong>ประเภท:</strong> {{ product.pdType || 'ไม่มีข้อมูล' }}</p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ducimus eligendi sit corporis
          inventore nostrum accusantium.
        </div>

        <hr class="my-4" />

        <div class="d-flex align-items-center gap-3">
          <div class="quantity-selector">
            <button class="btn btn-outline-secondary" @click="decreaseQuantity">-</button>
            <input
              type="text"
              class="form-control text-center"
              v-model.number="quantity"
              @change="validateQuantity"
            />
            <button class="btn btn-outline-secondary" @click="increaseQuantity">+</button>
          </div>

          <div class="dropdown flex-grow-1">
            <button
              class="btn btn-lg flex-grow-1 btn-add dropdown-toggle w-100"
              type="button"
              id="cartDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              :disabled="loading"
            >
              <i class="bi bi-cart-plus-fill me-2"></i>
              {{ selectedCart.id ? selectedCart.name : 'เลือก/สร้างตะกร้า' }}
            </button>

            <ul
              class="dropdown-menu"
              aria-labelledby="cartDropdown"
              style="max-height: 200px; overflow-y: auto"
            >
              <li>
                <a
                  class="dropdown-item text-success fw-bold"
                  href="#"
                  @click.prevent="createNewAndSelectCart"
                >
                  <i class="bi bi-plus-circle-fill me-2"></i> สร้างตะกร้าใหม่
                </a>
              </li>

              <li>
                <a
                  class="dropdown-item btn-add-in-dropdown"
                  href="#"
                  :disabled="!selectedCart.id"
                  @click.prevent="handleAddToCart"
                >
                  เพิ่ม {{ quantity }} ชิ้นลงในตะกร้า
                </a>
              </li>

              <li><hr class="dropdown-divider" /></li>

              <h6 class="dropdown-header">
                เลือกตะกร้าปัจจุบัน ({{ cartStore.totalCartCount }} ใบ)
              </h6>

              <li v-for="cart in cartStore.carts" :key="cart.cartId">
                <a
                  class="dropdown-item d-flex justify-content-between align-items-center"
                  href="#"
                  @click.prevent="selectCart(cart)"
                >
                  <span :class="{ 'fw-bold text-primary': selectedCart.id === cart.cartId }">
                    ตะกร้า #{{ cart.cartId.slice(-4) }}
                  </span>
                  <span class="badge bg-secondary ms-2">{{ cart.itemCount }} ชิ้น</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import { showToast } from '../services/toastService'

const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const quantity = ref(1)

const selectedCart = ref({
  id: null,
  name: 'เลือก/สร้างตะกร้า',
  itemCount: 0,
})

const API_BASE_URL = 'http://localhost:3000'
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600/f8f9fa/ccc?text=Image'

const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return PLACEHOLDER_IMAGE
  }

  return `${API_BASE_URL}/img_pd/${imagePath}?t=${new Date().getTime()}`
}

const onImageError = (event) => {
  event.target.src = PLACEHOLDER_IMAGE
}

const formatCurrency = (value) => {
  if (typeof value !== 'number') return ''
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(value)
}

const selectCart = (cart) => {
  if (!cart || !cart.cartId) {
    selectedCart.value = { id: null, name: 'เลือก/สร้างตะกร้า', itemCount: 0 }
    return
  }
  selectedCart.value.id = cart.cartId
  selectedCart.value.name = `ตะกร้า #${cart.cartId.slice(-4)} (${cart.itemCount} ชิ้น)`
  selectedCart.value.itemCount = cart.itemCount
  showToast(`เลือกตะกร้า #${cart.cartId.slice(-4)} แล้ว`, 'info', 1500)
}

const createNewAndSelectCart = async () => {
  if (!authStore.isAuthenticated) {
    showToast('กรุณาเข้าสู่ระบบก่อน', 'warning')
    return
  }
  const newCart = await cartStore.createNewCart()
  if (newCart && newCart.cartId) {
    selectCart(newCart)
  }
}

const increaseQuantity = () => {
  quantity.value++
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const validateQuantity = () => {
  if (quantity.value < 1 || !Number.isInteger(quantity.value)) {
    quantity.value = 1
  }
}

onMounted(async () => {
  const productId = route.params.id
  try {
    await cartStore.loadCartsForCurrentUser()
    if (cartStore.carts.length > 0 && cartStore.carts[0].cartId) {
      selectCart(cartStore.carts[0])
    }

    const response = await apiClient.get(`/products/${productId}`)

    const apiData = Array.isArray(response.data) ? response.data[0] : response.data
    if (apiData) {
      const finalId = apiData.pdId || productId
      product.value = {
        ...apiData,
        pdId: finalId,
        pdBrand: apiData.brand?.brandName || 'ไม่มีข้อมูล',
        pdType: apiData.pdt?.pdTypeName || 'ไม่มีข้อมูล',
        image: apiData.pd_image_url || null,
      }
    }
  } catch (err) {
    console.error('❌ Failed to fetch product:', err)
    error.value = 'ไม่พบสินค้าที่คุณค้นหา หรือเกิดข้อผิดพลาดในการเชื่อมต่อ'
  } finally {
    loading.value = false
  }
})

const handleAddToCart = async () => {
  if (!authStore.isAuthenticated) {
    showToast('กรุณาเข้าสู่ระบบก่อน', 'warning')
    return
  }
  if (!selectedCart.value.id) {
    showToast('กรุณาเลือกหรือสร้างตะกร้าก่อนเพิ่มสินค้า', 'warning')
    return
  }

  if (product.value) {
    const quantityToAdd = quantity.value
    await cartStore.addMultipleItemsToCart(product.value, quantityToAdd, selectedCart.value.id)

    await cartStore.loadCartsForCurrentUser()
    const updatedCart = cartStore.carts.find((c) => c.cartId === selectedCart.value.id)
    if (updatedCart) {
      selectCart(updatedCart)
    }
    quantity.value = 1
  }
}
</script>

<style scoped>
.body-c {
  margin-top: 80px;
}
.quantity-selector {
  display: flex;
  max-width: 150px;
}
.quantity-selector .form-control {
  border-left: none;
  border-right: none;
  border-radius: 0;
}
.quantity-selector .btn:first-of-type {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.quantity-selector .btn:last-of-type {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.product-detail-img {
  max-width: 80%;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.btn-add {
  background-color: #efa40d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  box-shadow: 0 4px 15px rgba(255, 106, 136, 0.3);
}

.btn-add:hover {
  background-color: #c08102;
  transform: translateY(-2px);
}
.dropdown-menu {
  bottom: auto !important;

  max-height: 300px;
  overflow-y: auto;
}
</style>
