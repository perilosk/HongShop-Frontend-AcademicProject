<template>
  <div class="container mt-5 edit-product-page">
    <div class="row justify-content-center">
      <div class="col-md-10 col-lg-8">
        <h2 class="text-center mb-4 text-warning">📝 แก้ไขสินค้า (Edit Product)</h2>

        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5 class="card-title">ค้นหาสินค้า</h5>
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                placeholder="ป้อนรหัสสินค้า (pdId) เพื่อค้นหา"
                v-model="searchId"
                @keyup.enter="handleSearch"
              />
              <button
                class="btn btn-primary"
                type="button"
                @click="handleSearch"
                :disabled="loadingSearch"
              >
                <span v-if="loadingSearch" class="spinner-border spinner-border-sm"></span>
                <span v-else>ค้นหา</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="productToEdit" class="card shadow-lg p-4 product-form-card">
          <h4 class="mb-3">
            แก้ไขข้อมูลของ: {{ productToEdit.pdName }} ({{ productToEdit.pdId }})
          </h4>

          <form @submit.prevent="handleUpdateProduct">
            <div class="mb-3">
              <label for="pdId" class="form-label">รหัสสินค้า (Product ID):</label>
              <input
                type="text"
                class="form-control"
                id="pdId"
                :value="productToEdit.pdId"
                readonly
                disabled
              />
            </div>

            <div class="mb-3">
              <label for="pdName" class="form-label required-label">ชื่อสินค้า:</label>
              <input
                type="text"
                class="form-control"
                id="pdName"
                v-model="productToEdit.pdName"
                required
              />
            </div>

            <div class="mb-3">
              <label for="pdPrice" class="form-label required-label">ราคาสินค้า:</label>
              <input
                type="number"
                class="form-control"
                id="pdPrice"
                v-model.number="productToEdit.pdPrice"
                required
              />
            </div>

            <div class="mb-3">
              <label for="pdTypeId" class="form-label required-label">ประเภทสินค้า:</label>
              <select class="form-select" id="pdTypeId" v-model="productToEdit.pdTypeId" required>
                <option v-if="loadingDropdowns" disabled>กำลังโหลด...</option>
                <option v-for="type in productTypes" :key="type.pdTypeId" :value="type.pdTypeId">
                  {{ type.pdTypeName }} ({{ type.pdTypeId }})
                </option>
              </select>
            </div>

            <div class="mb-4">
              <label for="brandId" class="form-label required-label">แบรนด์:</label>
              <select class="form-select" id="brandId" v-model="productToEdit.brandId" required>
                <option v-if="loadingDropdowns" disabled>กำลังโหลด...</option>
                <option v-for="brand in brands" :key="brand.brandId" :value="brand.brandId">
                  {{ brand.brandName }} ({{ brand.brandId }})
                </option>
              </select>
            </div>

            <div class="mb-4">
              <label for="productImage" class="form-label">รูปสินค้าใหม่:</label>
              <input
                class="form-control"
                id="productImage"
                type="file"
                @change="handleFileUpload"
                accept="image/*"
              />
              <p v-if="fileName" class="file-status mt-2">ไฟล์ที่เลือก: {{ fileName }}</p>
              <small class="form-text text-muted">เว้นว่างไว้หากไม่ต้องการเปลี่ยนรูปภาพ</small>
            </div>

            <button type="submit" class="btn btn-warning btn-lg w-100" :disabled="isSubmitting">
              {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import apiClient from '../services/api'
import { showToast } from '../services/toastService'
import { useAuthStore } from '../stores/authStore'

const searchId = ref('')
const productToEdit = ref(null)
const loadingSearch = ref(false)
const productTypes = ref([])
const brands = ref([])
const loadingDropdowns = ref(false)

const file = ref(null)
const fileName = ref('')
const isSubmitting = ref(false)

const authStore = useAuthStore()

const fetchDropdownData = async () => {
  loadingDropdowns.value = true
  try {
    const [typesRes, brandsRes] = await Promise.all([
      apiClient.get('/products/pdtypes'),
      apiClient.get('/products/brands'),
    ])
    productTypes.value = typesRes.data.data || typesRes.data
    brands.value = brandsRes.data.data || brandsRes.data
  } catch (error) {
    console.error('Error fetching dropdown data:', error)
    showToast('❌ ไม่สามารถโหลดข้อมูล Dropdown ได้', 'danger')
  } finally {
    loadingDropdowns.value = false
  }
}
onMounted(fetchDropdownData)

const handleSearch = async () => {
  if (!searchId.value) {
    showToast('⚠️ กรุณาป้อนรหัสสินค้าเพื่อค้นหา', 'warning')
    return
  }
  loadingSearch.value = true
  productToEdit.value = null
  file.value = null
  fileName.value = ''

  try {
    const response = await apiClient.get(`/products/${searchId.value}`)
    if (response.data && response.data.length > 0) {
      productToEdit.value = response.data[0]
      showToast('✅ พบข้อมูลสินค้า', 'success')
    } else {
      showToast(`❌ ไม่พบสินค้าสำหรับ ID: ${searchId.value}`, 'danger')
    }
  } catch (error) {
    console.error('Error searching product:', error)
    showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการค้นหา', 'danger')
  } finally {
    loadingSearch.value = false
  }
}

const handleFileUpload = (event) => {
  file.value = event.target.files[0]
  fileName.value = file.value ? file.value.name : ''
}

const handleUpdateProduct = async () => {
  if (!productToEdit.value) {
    showToast('❌ ไม่มีข้อมูลสินค้าที่จะอัปเดต', 'danger')
    return
  }

  const token = authStore.getToken()
  if (!authStore.isAuthenticated || !token) {
    showToast('❌ การดำเนินการนี้ต้องใช้สิทธิ์ Admin', 'danger')
    return
  }

  isSubmitting.value = true
  const formData = new FormData()

  formData.append('pdName', productToEdit.value.pdName)
  formData.append('pdPrice', productToEdit.value.pdPrice)
  formData.append('pdTypeId', productToEdit.value.pdTypeId)
  formData.append('brandId', productToEdit.value.brandId)

  if (file.value) {
    formData.append('file', file.value)
  }

  try {
    const response = await apiClient.put(`/products/${productToEdit.value.pdId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    showToast('✅ อัปเดตสินค้าเรียบร้อยแล้ว', 'success')

    productToEdit.value = null
    searchId.value = ''
    file.value = null
    fileName.value = ''
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดต'
    showToast(`❌ ${errorMessage}`, 'danger')
    console.error('Product Update error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.product-form-card {
  border-left: 5px solid #efa40d;
}
.required-label::after {
  content: ' *';
  color: #dc3545;
}
.file-status {
  margin-top: 10px;
  font-size: 0.9em;
  color: #007bff;
}
</style>
