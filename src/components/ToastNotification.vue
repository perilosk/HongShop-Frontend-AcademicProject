<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <transition-group name="toast-fade" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast show"
        :class="`text-bg-${toast.type}`"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div class="d-flex">
          <div class="toast-body">
            {{ toast.message }}
          </div>
          <button
            type="button"
            class="btn-close btn-close-white me-2 m-auto"
            @click="removeToastById(toast.id)"
            aria-label="Close"
          ></button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { toasts } from '../services/toastService'

const removeToastById = (id) => {
  const index = toasts.value.findIndex((toast) => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}
</script>

<style scoped>
.toast-container {
  z-index: 1100;
}

.toast-container .toast {
  margin-bottom: 0.75rem;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.5s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.toast-fade-move {
  transition: transform 0.3s ease;
}
</style>
