<template>
  <div class="home-page">
    <div class="carousel-container mb-5">
      <div
        id="heroCarousel"
        class="carousel slide"
        data-bs-ride="carousel"
        data-bs-interval="3000"
        data-bs-pause="false"
      >
        <div class="carousel-indicators">
          <button
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to="0"
            class="active"
            aria-current="true"
            aria-label="Slide 1"
          ></button>
          <button
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to="1"
            aria-label="Slide 2"
          ></button>
          <button
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to="2"
            aria-label="Slide 3"
          ></button>
          <button
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to="3"
            aria-label="Slide 4"
          ></button>
        </div>

        <div class="carousel-inner">
          <div
            v-for="(image, index) in carouselImages"
            :key="index"
            :class="['carousel-item', { active: index === 0 }]"
          >
            <img :src="image" class="d-block w-100" :alt="'Promotion ' + (index + 1)" />
          </div>
        </div>

        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>

    <div class="container products-section mb-5">
      <h2 class="section-title">✨ สินค้าแนะนำ (Featured Products)</h2>

      <div v-if="loadingFeatured" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
      <div v-else-if="errorFeatured" class="alert alert-danger">{{ errorFeatured }}</div>
      <div v-else class="row row-cols-2 row-cols-md-4 g-4">
        <div v-for="product in featuredProducts" :key="product.pdId" class="col">
          <ProductCard :product="product" />
        </div>
      </div>
      <div
        v-if="!loadingFeatured && featuredProducts.length === 0"
        class="alert alert-info text-center mt-4"
      >
        ไม่พบสินค้าแนะนำในขณะนี้
      </div>
    </div>
  </div>
</template>

<script setup>
import ProductCard from '../components/PageProduct.vue'
import { ref, onMounted } from 'vue'
import apiClient from '../services/api'

const promoImageSrc = 'https://picsum.photos/1400/500?random='
const carouselImages = ref([
  promoImageSrc + 1,
  promoImageSrc + 2,
  promoImageSrc + 3,
  promoImageSrc + 4,
])

const featuredProducts = ref([])
const loadingFeatured = ref(true)
const errorFeatured = ref(null)

const fetchFeaturedProducts = async () => {
  loadingFeatured.value = true
  errorFeatured.value = null
  try {
    const response = await apiClient.get('/products/featured')
    featuredProducts.value = response.data
  } catch (err) {
    console.error('Failed to fetch featured products:', err)
    errorFeatured.value = 'ไม่สามารถโหลดสินค้าแนะนำได้'
  } finally {
    loadingFeatured.value = false
  }
}

onMounted(() => {
  fetchFeaturedProducts()
  const carouselElement = document.getElementById('heroCarousel')
  if (carouselElement && window.bootstrap) {
    new window.bootstrap.Carousel(carouselElement, {
      interval: 3000,
      pause: false,
    })
  }
})
</script>

<style scoped>
.carousel-container {
  width: 95%;
  margin-left: auto;
  margin-right: auto;
  border-radius: 8px;
  overflow: hidden;
}
.carousel-item img {
  height: 500px;
  object-fit: cover;
}
.products-section {
  padding: 1rem;
}
.section-title {
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 700;
  color: #333;
}
</style>
