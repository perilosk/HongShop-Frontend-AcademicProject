<template>
  <div class="container my-5">
    <h1 class="mb-4">ตะกร้าสินค้าที่ยังไม่ยืนยัน</h1>

    <div v-if="cartStore.carts.length > 0" class="list-group">
      <div
        v-for="cart in cartStore.carts"
        :key="cart.cartId"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <router-link
          :to="`/cart/${cart.cartId}`"
          class="text-decoration-none text-dark flex-grow-1"
        >
          <div>
            <h5 class="mb-1">ตะกร้าหมายเลข #{{ cart.cartId }}</h5>
            <small>สร้างเมื่อ: {{ new Date(cart.createdAt).toLocaleDateString('th-TH') }}</small>
          </div>
        </router-link>

        <div class="d-flex align-items-center">
          <button
            class="btn btn-outline-danger btn-sm"
            @click.stop="confirmDeleteCart(cart.cartId)"
          >
            <i class="bi bi-trash-fill"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-info" role="alert">
      คุณยังไม่มีตะกร้าสินค้า ลองเพิ่มสินค้าชิ้นแรกลงในตะกร้าได้เลย!
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cartStore'

const cartStore = useCartStore()

const confirmDeleteCart = (cartId) => {
  if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบตะกร้า #${cartId} ทั้งหมด?`)) {
    cartStore.deleteCart(cartId)
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
}
.list-group-item {
  padding: 1.25rem;
}

.list-group-item a:hover h5 {
  color: #0d6efd;
}
</style>
