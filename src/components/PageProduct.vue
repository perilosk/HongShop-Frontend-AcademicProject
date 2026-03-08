<template>
  <div class="col">
    <div class="card h-100 product-card">
      <img
        :src="getImageUrl(product.pd_image_url)"
        class="card-img-top"
        :alt="product.pdName"
        @error="onImageError"
      />
      <div class="card-body d-flex flex-column">
        <h5 class="card-title mt-auto">{{ product.pdName }}</h5>
        <p class="card-text">{{ formatCurrency(product.pdPrice) }}</p>
      </div>
      <div class="card-footer">
        <div class="d-flex gap-2">
          <router-link :to="`/product/${product.pdId}`" class="btn btn-detail w-100">
            รายละเอียด
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
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
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(value)
}
</script>

<style scoped>
.product-card {
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  border: 1px solid #e9ecef;
  border-radius: 1rem;
  overflow: hidden;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}
.card-img-top {
  aspect-ratio: 1 / 1;
  object-fit: cover;
}
.card-body,
.card-footer {
  text-align: center;
  background-color: white;
}
.card-footer {
  border-top: none;
  padding: 0 1rem 1rem 1rem;
}
.btn-detail {
  height: 40px;
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

.btn-detail:hover {
  background-color: #c08102;
  transform: translateY(-2px);
}
</style>
