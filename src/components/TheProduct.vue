<template>
  <div class="container my-5">
    <h1 v-if="searchTerm" class="mb-4">ผลการค้นหาสำหรับ: "{{ searchTerm }}"</h1>
    <h1 v-else class="mb-4">สินค้าทั้งหมด</h1>

    <div class="row mb-4 p-3 bg-light border rounded-3">
      <div class="col-md-6 mb-2 mb-md-0">
        <label for="filterType" class="form-label fw-bold">กรองตามประเภทสินค้า:</label>
        <select id="filterType" class="form-select" v-model="selectedType" :disabled="loading">
          <option value="">-- ทุกประเภท --</option>
          <option v-for="type in productTypes" :key="type.pdTypeId" :value="type.pdTypeId">
            {{ type.pdTypeName }}
          </option>
        </select>
      </div>
      <div class="col-md-6">
        <label for="filterBrand" class="form-label fw-bold">กรองตามแบรนด์:</label>
        <select id="filterBrand" class="form-select" v-model="selectedBrand" :disabled="loading">
          <option value="">-- ทุกแบรนด์ --</option>
          <option v-for="brand in brands" :key="brand.brandId" :value="brand.brandId">
            {{ brand.brandName }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <p class="mb-0">เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า: {{ error }}</p>
    </div>

    <div v-else-if="paginatedProducts.length > 0">
      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 row-cols-lg-4 g-4">
        <PageProduct v-for="product in paginatedProducts" :key="product.pdId" :product="product" />
      </div>

      <nav
        v-if="totalPages > 1"
        aria-label="Page navigation"
        class="mt-5 d-flex justify-content-center"
      >
        <ul class="pagination pagination-minimal">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">ก่อนหน้า</a>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">ถัดไป</a>
          </li>
        </ul>
      </nav>
    </div>

    <div v-else class="alert alert-secondary text-center">
      <p class="mb-0" v-if="searchTerm || selectedType || selectedBrand">
        ไม่พบสินค้าที่ตรงกับคำค้นหาของคุณ
      </p>
      <p class="mb-0" v-else>ไม่พบสินค้าในระบบ</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageProduct from '../components/PageProduct.vue'
import apiClient from '../services/api'

const allProducts = ref([])
const loading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const itemsPerPage = 12
const searchTerm = ref('')

const productTypes = ref([])
const brands = ref([])
const selectedType = ref('')
const selectedBrand = ref('')
const route = useRoute()

const filteredProducts = computed(() => {
  let products = allProducts.value

  if (searchTerm.value) {
    products = products.filter((product) =>
      product.pdName.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  }

  if (selectedType.value) {
    products = products.filter((product) => product.pdTypeId == selectedType.value)
  }

  if (selectedBrand.value) {
    products = products.filter((product) => product.brandId == selectedBrand.value)
  }

  return products
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage)
})

const paginatedProducts = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filteredProducts.value.slice(startIndex, endIndex)
})

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const updateSearchFromRoute = () => {
  searchTerm.value = route.query.search || ''
  currentPage.value = 1
}

const fetchInitialData = async () => {
  loading.value = true
  error.value = null
  try {
    const [productsRes, typesRes, brandsRes] = await Promise.all([
      apiClient.get('/products'),
      apiClient.get('/products/pdtypes'),
      apiClient.get('/products/brands'),
    ])

    allProducts.value = productsRes.data.data || productsRes.data
    productTypes.value = typesRes.data.data || typesRes.data
    brands.value = brandsRes.data.data || brandsRes.data

    updateSearchFromRoute()
  } catch (err) {
    console.error('Failed to fetch initial data:', err)
    error.value = err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
  } finally {
    loading.value = false
  }
}

onMounted(fetchInitialData)

watch(
  () => route.query.search,
  () => {
    updateSearchFromRoute()
  },
)

watch([selectedType, selectedBrand], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.pagination-minimal .page-item:first-child .page-link {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}
.pagination-minimal .page-item:last-child .page-link {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.pagination-minimal .page-link {
  color: #495057;
  background-color: #ffffff;
  border-color: #dee2e6;
  transition: all 0.2s ease-in-out;
  margin: 0 4px;
  border-radius: 8px !important;
  min-width: 40px;
  text-align: center;
}

.pagination-minimal .page-link:hover {
  color: #212529;
  background-color: #e9ecef;
  border-color: #adb5bd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.pagination-minimal .page-item.active .page-link {
  z-index: 3;
  color: #ffffff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.pagination-minimal .page-item.disabled .page-link {
  color: #adb5bd;
  pointer-events: none;
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.pagination-minimal .page-item:not(:first-child) .page-link {
  margin-left: 4px;
  border-left-width: 1px;
}
.pagination-minimal .page-item:first-child .page-link,
.pagination-minimal .page-item:last-child .page-link {
  border-radius: 8px !important;
}
.container {
  min-height: 70vh;
}
</style>
