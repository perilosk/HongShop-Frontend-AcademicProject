<template>
  <div class="container my-5">
    <h1 class="mb-4">ประวัติการสั่งซื้อ</h1>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <p class="mb-0">เกิดข้อผิดพลาดในการโหลดประวัติการสั่งซื้อ: {{ error }}</p>
    </div>

    <div v-else-if="confirmedOrders.length > 0">
      <div class="table-responsive">
        <table class="table align-middle table-hover">
          <thead class="table-light">
            <tr>
              <th scope="col">รหัสคำสั่งซื้อ</th>
              <th scope="col" class="text-center">จำนวนรายการ</th>
              <th scope="col" class="text-end">ยอดรวม</th>
              <th scope="col" class="text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in confirmedOrders"
              :key="order.cartId"
              @click="viewOrderDetail(order.cartId)"
              class="clickable-row"
            >
              <td>#{{ order.cartId.slice(-6) }}</td>
              <td class="text-center">{{ order.itemCount }}</td>
              <td class="text-end">{{ formatCurrency(order.totalPrice) }}</td>
              <td class="text-center">
                <span class="badge bg-success">สำเร็จ</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="alert alert-secondary text-center">
      <p class="mb-0">คุณยังไม่มีประวัติการสั่งซื้อที่ยืนยันแล้ว</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../services/api'
import { showToast } from '../services/toastService'

const confirmedOrders = ref([])
const loading = ref(true)
const error = ref(null)
const router = useRouter()

const fetchOrderHistory = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await apiClient.get('/carts/history')
    confirmedOrders.value = response.data
  } catch (err) {
    console.error('Failed to fetch order history:', err)
    error.value =
      err.response?.data?.message || err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrderHistory)

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'N/A'
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value)
}

const viewOrderDetail = (cartId) => {
  router.push(`/order/${cartId}`)
}
</script>

<style scoped>
.container {
  max-width: 900px;
  min-height: 70vh;
}
.badge.bg-success {
  font-size: 0.9rem;
}
.clickable-row {
  cursor: pointer;
}
.clickable-row:hover {
  background-color: #f8f9fa;
}
</style>
