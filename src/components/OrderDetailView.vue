<template>
  <div class="container my-5">
    <div v-if="loading" class="text-center py-5"></div>

    <div v-else-if="cartItems.length > 0">
      <h1 class="mb-4">รายละเอียดคำสั่งซื้อ #{{ cartId.slice(-6) }}</h1>

      <div class="table-responsive">
        <table class="table align-middle">
          <thead class="table-light">
            <tr>
              <th scope="col">สินค้า</th>
              <th scope="col" class="text-center">จำนวน</th>
              <th scope="col" class="text-end">ราคาต่อชิ้น</th>
              <th scope="col" class="text-end">ราคารวม</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cartItems" :key="item.pdId">
              <td>{{ item.pdName }}</td>
              <td class="text-center">{{ item.qty }}</td>
              <td class="text-end">{{ formatCurrency(item.price) }}</td>
              <td class="text-end">{{ formatCurrency(item.qty * item.price) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="fw-bold">
              <td colspan="3" class="text-end">ยอดรวมทั้งหมด</td>
              <td class="text-end fs-5 text-danger">{{ formatCurrency(totalPrice) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div v-else class="alert alert-warning">ไม่พบรายละเอียดคำสั่งซื้อนี้</div>

    <button @click="goBack" class="btn btn-outline-secondary mt-3">
      <i class="bi bi-arrow-left"></i> กลับไปหน้าก่อนหน้า
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../services/api'
import { showToast } from '../services/toastService'

const route = useRoute()
const router = useRouter()
const cartId = route.params.id
const cartItems = ref([])
const loading = ref(true)

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

onMounted(fetchCartDetails)

const goBack = () => {
  router.go(-1)
}

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.qty * item.price, 0)
})

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'N/A'
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value)
}
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>
