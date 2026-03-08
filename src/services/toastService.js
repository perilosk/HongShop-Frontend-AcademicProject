import { ref } from 'vue'

export const toasts = ref([])

/**
 *
 * @param {string} message
 * @param {string} type
 * @param {number} duration
 */
export function showToast(message, type = 'success', duration = 4000) {
  const id = Date.now() + Math.random()

  toasts.value.push({ id, message, type })
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

/**
 * @param {number} id
 */
function removeToast(id) {
  const index = toasts.value.findIndex((toast) => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}
