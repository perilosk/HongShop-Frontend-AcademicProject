<template>
  <div class="container my-5">
    <div v-if="loading" class="text-center py-5"></div>

    <div v-else-if="cartItems.length > 0">
      <h1 class="mb-4">รายละเอียดตะกร้า #{{ cartId.slice(-6) }}</h1>

      <div class="table-responsive">
        <table class="table align-middle table-hover">
          <thead class="table-light">
            <tr>
              <th scope="col">สินค้า</th>
              <th scope="col" class="text-center">จำนวน</th>
              <th scope="col" class="text-end">ราคาต่อชิ้น</th>
              <th scope="col" class="text-end">ราคารวม</th>
              <th scope="col" class="text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cartItems" :key="item.pdId">
              <td>{{ item.pdName }}</td>
              <td class="text-center">
                <div class="input-group input-group-sm quantity-control mx-auto">
                  <button
                    class="btn-qty-naked"
                    type="button"
                    @click="updateQuantity(item.pdId, item.qty - 1)"
                    :disabled="item.qty <= 1"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    class="form-control text-center"
                    :value="item.qty"
                    readonly
                  />
                  <button
                    class="btn-qty-naked"
                    type="button"
                    @click="updateQuantity(item.pdId, item.qty + 1)"
                  >
                    +
                  </button>
                </div>
              </td>
              <td class="text-end">{{ formatCurrency(item.price) }}</td>
              <td class="text-end">{{ formatCurrency(item.qty * item.price) }}</td>
              <td class="text-center">
                <button class="btn btn-outline-danger btn-sm" @click="handleDeleteItem(item.pdId)">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="fw-bold">
              <td colspan="4" class="text-end">ยอดรวมทั้งหมด</td>
              <td class="text-end fs-5 text-danger">{{ formatCurrency(totalPrice) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div v-else class="alert alert-warning">ตะกร้านี้ว่างเปล่า</div>

    <div class="d-flex justify-content-between align-items-center mt-4">
      <router-link to="/cart" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left"></i> กลับไปหน้ารายการตะกร้า
      </router-link>

      <button
        v-if="cartItems.length > 0"
        class="btn btn-success btn-lg"
        @click="handleConfirmOrder"
      >
        <i class="bi bi-check-circle-fill me-2"></i> ยืนยันการสั่งซื้อ
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../services/api'
import { useCartStore } from '../stores/cartStore'
import { showToast } from '../services/toastService'

const route = useRoute()
const router = useRouter()
const cartId = route.params.id
const cartItems = ref([])
const loading = ref(true)
const cartStore = useCartStore()

const fetchCartDetails = async () => {
  loading.value = true
  try {
    const response = await apiClient.get(`/carts/getcartdtl/${cartId}`)
    cartItems.value = response.data
  } catch (error) {
    console.error(`Error fetching details for cart ${cartId}:`, error)
    showToast('ไม่สามารถดึงรายละเอียดตะกร้าได้', 'danger')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await cartStore.loadCartsForCurrentUser()
  await fetchCartDetails()
})

const handleDeleteItem = async (pdId) => {
  if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้ออกจากตะกร้า?`)) {
    const success = await cartStore.deleteCartItem(cartId, pdId)
    if (success) {
      await fetchCartDetails()
    }
  }
}

const updateQuantity = async (pdId, newQty) => {
  if (newQty < 1) {
    if (window.confirm('ต้องการลบสินค้านี้ออกจากตะกร้าหรือไม่?')) {
      await handleDeleteItem(pdId)
    }
    return
  }

  const itemToUpdate = cartItems.value.find((item) => item.pdId === pdId)
  if (!itemToUpdate) return
  const oldQty = itemToUpdate.qty
  itemToUpdate.qty = newQty

  try {
    const response = await cartStore.updateCartItemQuantity(cartId, pdId, newQty)
    if (response.success) {
      await fetchCartDetails()
      await cartStore.loadCartsForCurrentUser()
    } else {
      itemToUpdate.qty = oldQty
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('❌ Error updating quantity:', error)
    itemToUpdate.qty = oldQty
    showToast(error.message || 'เกิดข้อผิดพลาดในการอัปเดตจำนวนสินค้า', 'danger')
  }
}

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.qty * item.price, 0)
})

const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    return 'N/A'
  }
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(value)
}

const handleConfirmOrder = async () => {
  if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการยืนยันการสั่งซื้อนี้?')) {
    try {
      const success = await cartStore.confirmOrder(cartId)
      if (success) {
        showToast('ยืนยันการสั่งซื้อสำเร็จ!', 'success')
        router.push('/history')
      }
    } catch (error) {
      console.error('Error in handleConfirmOrder:', error)
      showToast(error.message || 'เกิดข้อผิดพลาดในการยืนยันคำสั่งซื้อ', 'danger')
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 900px;
}
.quantity-control {
  width: 120px;
}
.btn-qty-naked {
  background: none;
  border: none;
  padding: 0 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2rem;
  line-height: 1;
  color: #404040;
  transition: color 0.2s;
}
.btn-qty-naked:hover {
  color: #0a58ca;
}
.quantity-control .form-control {
  border-left: none;
  border-right: none;
}
</style>
