<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-lg p-4 product-form-card">
          <h2 class="card-title text-center mb-4 text-success">
            ➕ เพิ่มสินค้าใหม่ (Add New Product)
          </h2>

          <form @submit.prevent="submitProduct">
            <div class="mb-3">
              <label for="pdId" class="form-label required-label">รหัสสินค้า (Product ID):</label>
              <input
                type="text"
                class="form-control"
                id="pdId"
                v-model="newProduct.pdId"
                placeholder="ระบุรหัสสินค้า"
                required
              />
              <small class="form-text text-muted">ต้องระบุรหัสสินค้าเพื่อใช้เป็นคีย์หลัก</small>
            </div>

            <div class="mb-3">
              <label for="pdName" class="form-label required-label"
                >ชื่อสินค้า (Product Name):</label
              >
              <input
                type="text"
                class="form-control"
                id="pdName"
                v-model="newProduct.pdName"
                required
              />
            </div>

            <div class="mb-3">
              <label for="pdPrice" class="form-label required-label"
                >ราคาสินค้า (Product Price):</label
              >
              <input
                type="number"
                class="form-control"
                id="pdPrice"
                v-model.number="newProduct.pdPrice"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div class="mb-3">
              <label for="pdTypeId" class="form-label required-label"
                >ประเภทสินค้า (Product Type):</label
              >
              <select class="form-select" id="pdTypeId" v-model="newProduct.pdTypeId" required>
                <option value="" disabled>--- เลือกประเภทสินค้า ---</option>
                <option v-if="loadingTypes" disabled>กำลังโหลด...</option>
                <option v-else-if="productTypes.length === 0" disabled>ไม่พบประเภทสินค้า</option>
                <option v-for="type in productTypes" :key="type.pdTypeId" :value="type.pdTypeId">
                  {{ type.pdTypeName }} ({{ type.pdTypeId }})
                </option>
              </select>
            </div>

            <div class="mb-4">
              <label for="brandId" class="form-label required-label">แบรนด์ (Brand):</label>
              <select class="form-select" id="brandId" v-model="newProduct.brandId" required>
                <option value="" disabled>--- เลือกแบรนด์สินค้า ---</option>
                <option v-if="loadingBrands" disabled>กำลังโหลด...</option>
                <option v-else-if="brands.length === 0" disabled>ไม่พบแบรนด์สินค้า</option>
                <option v-for="brand in brands" :key="brand.brandId" :value="brand.brandId">
                  {{ brand.brandName }} ({{ brand.brandId }})
                </option>
              </select>
            </div>

            <button type="submit" class="btn btn-success btn-lg w-100">บันทึกและเพิ่มสินค้า</button>
          </form>

          <div
            v-if="message"
            :class="['alert mt-4 text-center', isSuccess ? 'alert-success' : 'alert-danger']"
          >
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { showToast } from '../services/toastService'
import { useAuthStore } from '../stores/authStore'

const newProduct = ref({
  pdId: '',
  pdName: '',
  pdPrice: null,
  pdTypeId: '',
  brandId: '',
})

const productTypes = ref([])
const brands = ref([])
const loadingTypes = ref(false)
const loadingBrands = ref(false)

const API_BASE_URL = 'http://localhost:3000'
const authStore = useAuthStore()

const fetchDropdownData = async () => {
  loadingTypes.value = true
  loadingBrands.value = true

  try {
    const response = await axios.get(`${API_BASE_URL}/products/pdtypes`)
    productTypes.value = response.data.data || response.data
  } catch (error) {
    console.error('Error fetching product types:', error)
    showToast('❌ ไม่สามารถโหลดประเภทสินค้าได้', 'danger')
  } finally {
    loadingTypes.value = false
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/products/brands`)
    brands.value = response.data.data || response.data
  } catch (error) {
    console.error('Error fetching brands:', error)
    showToast('❌ ไม่สามารถโหลดข้อมูลแบรนด์ได้', 'danger')
  } finally {
    loadingBrands.value = false
  }

  if (productTypes.value.length > 0) {
    newProduct.value.pdTypeId = productTypes.value[0].pdTypeId
  }
  if (brands.value.length > 0) {
    newProduct.value.brandId = brands.value[0].brandId
  }
}

onMounted(fetchDropdownData)

const submitProduct = async () => {
  if (
    !newProduct.value.pdId ||
    !newProduct.value.pdName ||
    newProduct.value.pdPrice <= 0 ||
    !newProduct.value.pdTypeId ||
    !newProduct.value.brandId
  ) {
    showToast('⚠️ โปรดกรอกข้อมูลสินค้าให้ครบถ้วนและถูกต้อง', 'danger')
    return
  }

  const token = authStore.getToken()

  if (!authStore.isAuthenticated || !token) {
    showToast('❌ การดำเนินการนี้ต้องใช้สิทธิ์ Admin กรุณาเข้าสู่ระบบอีกครั้ง.', 'danger')
    return
  }

  const productDataToSend = newProduct.value

  try {
    const response = await axios.post(`${API_BASE_URL}/products`, productDataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    showToast(`✅ เพิ่มสินค้า **${newProduct.value.pdName}** เรียบร้อยแล้ว!`, 'success')

    newProduct.value = {
      pdId: '',
      pdName: '',
      pdPrice: null,
      pdTypeId: productTypes.value.length > 0 ? productTypes.value[0].pdTypeId : '',
      brandId: brands.value.length > 0 ? brands.value[0].brandId : '',
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์'
    const status = error.response?.status

    if (status === 403) {
      showToast(`❌ สิทธิ์ไม่พอ: กรุณาเข้าสู่ระบบในฐานะ Admin.`, 'danger')
    } else if (status === 409) {
      showToast(`❌ รหัสสินค้านี้ซ้ำ: ${errorMessage}`, 'danger')
    } else {
      showToast(`❌ รหัสสินค้านี้ซ้ำ`, 'danger')
    }
    console.error('Product Add error:', error)
  }
}
</script>

<style scoped>
.product-form-card {
  border-left: 5px solid #198754;
  border-radius: 12px;
}
.required-label::after {
  content: ' *';
  color: #dc3545;
}
</style>
