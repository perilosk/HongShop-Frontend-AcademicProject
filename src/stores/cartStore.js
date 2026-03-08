import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import { showToast } from '../services/toastService'
import apiClient from '../services/api'

export const useCartStore = defineStore('cart', () => {
  const carts = ref([])
  const authStore = useAuthStore()

  const totalItemCount = computed(() => {
    return carts.value.reduce((total, cart) => total + (cart.itemCount || 0), 0)
  })

  const totalQuantity = computed(() => {
    return carts.value.reduce((sum, cart) => sum + cart.itemCount, 0)
  })

  const totalCartCount = computed(() => {
    return carts.value.length
  })

  const updateCartItemQuantity = async (cartId, pdId, newQty) => {
    try {
      const response = await apiClient.put(`/carts/updateqtydtl/${cartId}/${pdId}`, {
        qty: newQty,
      })
      return { success: true, message: 'Quantity updated.' }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return {
          success: false,
          message: error.response.data.message || 'Update failed due to limit.',
        }
      }
      console.error('API Error updating quantity:', error)
      return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์.' }
    }
  }

  async function loadCartsForCurrentUser() {
    if (!authStore.isAuthenticated) return
    try {
      const response = await apiClient.post('/carts/chkcart')
      if (response.data.cartExist) {
        const cartHeaders = response.data.carts

        const cartDetailsPromises = cartHeaders.map((cartHeader) =>
          apiClient.get(`/carts/sumcart/${cartHeader.cartId}`),
        )
        const cartDetailsResults = await Promise.all(cartDetailsPromises)

        carts.value = cartHeaders.map((cartHeader, index) => {
          const details = cartDetailsResults[index].data
          return {
            cartId: cartHeader.cartId,
            createdAt: cartHeader.cartDate,
            itemCount: parseInt(details.qty, 10) || 0,
          }
        })
      } else {
        carts.value = []
      }
    } catch (error) {
      console.error('Error loading user carts:', error)
      carts.value = []
    }
  }

  async function createNewCart() {
    try {
      const response = await apiClient.post('/carts/addcart')
      if (response.data.cartOK) {
        const newCartId = response.data.messageAddCart
        showToast(`สร้างตะกร้าใหม่สำเร็จ! #${newCartId.slice(-4)}`, 'success')

        await new Promise((resolve) => setTimeout(resolve, 300))

        await loadCartsForCurrentUser()

        const newlyCreatedCart = carts.value.find((c) => c.cartId === newCartId)

        if (newlyCreatedCart) {
          return newlyCreatedCart
        } else {
          console.error('Created cart not found in state after loading.')
          return null
        }
      }
      return null
    } catch (error) {
      console.error('Error creating new cart:', error)
      showToast('ไม่สามารถสร้างตะกร้าใหม่ได้', 'danger')
      return null
    }
  }

  async function addProductToCartAPI(cartId, product) {
    try {
      const productId = product.pdId || product.id || product.Id

      if (!productId) {
        throw new Error('Product object is missing a valid ID')
      }

      const payload = { cartId, pdId: productId }
      const response = await apiClient.post('/carts/addcartdtl', payload)

      if (!response.data.cartDtlOK) {
        throw new Error(response.data.messageAddCartDtl || 'Failed to add product detail.')
      }
    } catch (error) {
      throw error
    }
  }

  async function addMultipleItemsToCart(product, quantity, targetCartId = null) {
    if (!authStore.isAuthenticated) {
      showToast('กรุณาเข้าสู่ระบบก่อน', 'warning')
      return
    }

    let finalCartId = targetCartId

    try {
      await loadCartsForCurrentUser()

      let targetCart = null
      if (targetCartId) {
        targetCart = carts.value.find((cart) => cart.cartId === targetCartId)
      }

      if (!targetCart) {
        showToast('กำลังสร้างตะกร้าใหม่...', 'info')

        const newlyCreatedCart = await createNewCart()

        if (!newlyCreatedCart || !newlyCreatedCart.cartId) {
          throw new Error('ไม่สามารถหาหรือสร้างตะกร้าเพื่อเพิ่มสินค้าได้')
        }
        finalCartId = newlyCreatedCart.cartId
      }

      let totalSuccessCount = 0
      for (let i = 0; i < quantity; i++) {
        try {
          await addProductToCartAPI(finalCartId, product)
          totalSuccessCount++
        } catch (apiError) {
          console.error('API Error adding product (partial failure):', apiError)
          showToast(`เพิ่มสินค้าไม่สำเร็จที่ชิ้นที่ ${i + 1}/${quantity}`, 'danger')
          break
        }
      }

      if (totalSuccessCount > 0) {
        await loadCartsForCurrentUser()
        showToast(
          `เพิ่มสินค้า ${totalSuccessCount} ชิ้นลงในตะกร้า #${finalCartId.slice(-4)} เรียบร้อยแล้ว`,
          'success',
        )
      } else {
        throw new Error('ไม่สามารถเพิ่มสินค้าได้เลย (API ล้มเหลวทั้งหมด)')
      }
    } catch (error) {
      console.error('Final Error in addMultipleItemsToCart:', error)
      showToast(error.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า', 'danger')
      await loadCartsForCurrentUser()
    }
  }

  async function addToCart(product) {
    await addMultipleItemsToCart(product, 1)
  }

  async function deleteCart(cartId) {
    try {
      const response = await apiClient.delete('/carts/delcart', { data: { cartId } })
      if (!response.data.error) {
        showToast(`ลบตะกร้า #${cartId.slice(-4)} สำเร็จ`, 'success')
        await loadCartsForCurrentUser()
      } else {
        throw new Error(response.data.message || 'API reported an error.')
      }
    } catch (error) {
      console.error('Error deleting cart:', error)
      showToast('เกิดข้อผิดพลาดในการลบตะกร้า', 'danger')
    }
  }

  async function deleteCartItem(cartId, pdId) {
    try {
      const response = await apiClient.delete('/carts/delcartdtl', { data: { cartId, pdId } })
      if (!response.data.error) {
        showToast(`ลบสินค้าออกจากตะกร้าแล้ว`, 'success')
        await loadCartsForCurrentUser()
        return true
      } else {
        throw new Error(response.data.message || 'API reported an error.')
      }
    } catch (error) {
      console.error('Error deleting cart item:', error)
      showToast('เกิดข้อผิดพลาดในการลบสินค้า', 'danger')
      return false
    }
  }

  async function confirmOrder(cartId) {
    try {
      const response = await apiClient.post(`/carts/confirm/${cartId}`)
      await loadCartsForCurrentUser()

      return true
    } catch (error) {
      const msg = error.response?.data?.message || 'ยืนยันคำสั่งซื้อล้มเหลว'
      showToast(msg, 'danger')
      return false
    }
  }

  function clearCartOnLogout() {
    carts.value = []
  }

  return {
    carts,
    totalItemCount,
    totalQuantity,
    totalCartCount,
    createNewCart,
    addToCart,
    addMultipleItemsToCart,
    loadCartsForCurrentUser,
    clearCartOnLogout,
    deleteCart,
    deleteCartItem,
    updateCartItemQuantity,
    confirmOrder,
  }
})
