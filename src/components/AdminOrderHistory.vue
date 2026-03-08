<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4 text-secondary">📦 ประวัติการสั่งซื้อลูกค้า (All Order History)</h2>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else class="card shadow-sm">
      <div class="card-body">
        <h5 class="card-title mb-3">
          คำสั่งซื้อที่ยืนยันแล้ว ({{ filteredOrders.length }} รายการ)
        </h5>

        <div class="mb-3">
          <input
            type="text"
            class="form-control"
            placeholder="ค้นหาด้วย Email หรือ รหัสคำสั่งซื้อ..."
            v-model="searchTerm"
          />
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th scope="col">รหัสคำสั่งซื้อ (cartId)</th>
                <th scope="col">ลูกค้า (cusId)</th>
                <th scope="col" class="text-center">จำนวนรายการ</th>
                <th scope="col" class="text-end">ยอดรวม</th>
                <th scope="col" class="text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in filteredOrders"
                :key="order.cartId"
                @click="viewOrderDetail(order.cartId)"
                class="clickable-row"
              >
                <td>#{{ order.cartId.slice(-6) }}</td>
                <td>{{ order.memEmail }}</td>
                <td class="text-center">{{ order.itemCount }}</td>
                <td class="text-end">{{ formatCurrency(order.totalPrice) }}</td>
                <td class="text-center">
                  <span class="badge bg-success">สำเร็จ</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredOrders.length === 0" class="alert alert-info text-center mt-3">
            ไม่พบคำสั่งซื้อที่ตรงกับคำค้นหา
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { showToast } from '../services/toastService'

const allOrders = ref([])
const searchTerm = ref('')
const loading = ref(true)
const error = ref(null)
const router = useRouter()
const authStore = useAuthStore()

const filteredOrders = computed(() => {
  if (!searchTerm.value) {
    return allOrders.value
  }

  const lowerSearchTerm = searchTerm.value.toLowerCase().trim()

  return allOrders.value.filter((order) => {
    const emailMatch = order.memEmail.toLowerCase().includes(lowerSearchTerm)

    const cartIdMatch =
      order.cartId.toLowerCase().includes(lowerSearchTerm) ||
      order.cartId.slice(-6).includes(lowerSearchTerm)

    return emailMatch || cartIdMatch
  })
})

const fetchAllOrderHistory = async () => {
  loading.value = true
  error.value = null
  try {
    const token = authStore.getToken()
    if (!token) throw new Error('Authentication Token not found')

    const response = await apiClient.get('/admin/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })

    allOrders.value = response.data
  } catch (err) {
    console.error('Failed to fetch admin order history:', err)
    error.value = err.response?.data?.message || err.message || 'Could not fetch order history'
    showToast(error.value, 'danger')
  } finally {
    loading.value = false
  }
}

onMounted(fetchAllOrderHistory)

const viewOrderDetail = (cartId) => {
  router.push(`/order/${cartId}`)
}

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'N/A'
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value)
}
</script>

<style scoped>
.table-responsive {
  max-height: 60vh;
  overflow-y: auto;
}
.clickable-row {
  cursor: pointer;
}
.clickable-row:hover {
  background-color: #f8f9fa;
}
</style>
