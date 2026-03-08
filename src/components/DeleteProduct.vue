<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4 text-danger">🗑️ ลบสินค้า (Delete Product)</h2>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else class="card shadow-sm">
      <div class="card-body">
        <h5 class="card-title mb-3">รายการสินค้าทั้งหมดในระบบ ({{ products.length }} รายการ)</h5>

        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th scope="col">รหัสสินค้า (pdId)</th>
                <th scope="col">ชื่อสินค้า</th>
                <th scope="col" class="text-end">ราคา</th>
                <th scope="col" class="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.pdId">
                <td>{{ product.pdId }}</td>
                <td>{{ product.pdName }}</td>

                <td class="text-end">{{ formatCurrency(product.pdPrice) }}</td>
                <td class="text-center">
                  <button
                    class="btn btn-outline-danger btn-sm"
                    @click="handleDeleteProduct(product)"
                  >
                    <i class="bi bi-trash-fill"></i> ลบ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="!loading && products.length === 0" class="alert alert-info text-center mt-3">
            ไม่พบสินค้าในระบบ
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { showToast } from '../services/toastService'

const products = ref([])
const loading = ref(true)
const error = ref(null)
const authStore = useAuthStore()

const fetchProducts = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await apiClient.get('/products')

    products.value = response.data
  } catch (err) {
    console.error('Failed to fetch products:', err)
    error.value = err.response?.data?.message || 'ไม่สามารถดึงข้อมูลสินค้าได้'
    showToast(error.value, 'danger')
  } finally {
    loading.value = false
  }
}

onMounted(fetchProducts)

const handleDeleteProduct = async (product) => {
  if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${product.pdName} (ID: ${product.pdId})?`)) {
    return
  }

  const token = authStore.getToken()
  if (!authStore.isAuthenticated || !token) {
    showToast('❌ การดำเนินการนี้ต้องใช้สิทธิ์ Admin', 'danger')
    return
  }

  try {
    await apiClient.delete(`/products/${product.pdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    showToast('✅ ลบสินค้าสำเร็จแล้ว', 'success')

    products.value = products.value.filter((p) => p.pdId !== product.pdId)
  } catch (err) {
    console.error('Failed to delete product:', err)
    const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบสินค้า'
    showToast(`❌ ${errorMessage}`, 'danger')
  }
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
</style>
