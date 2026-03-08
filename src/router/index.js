import { createRouter, createWebHistory } from 'vue-router'
import TheProduct from '@/components/TheProduct.vue'
import TheLogin from '@/components/TheLogin.vue'
import TheRegister from '@/components/TheRegister.vue'
import Profile from '@/components/Profile.vue'
import EditProfile from '@/components/EditProfile.vue'
import CartView from '@/components/CartView.vue'
import CartViewDtl from '@/components/CartViewDtl.vue'
import ProductDetailView from '@/components/ProductDetailView.vue'
import TheHome from '@/components/TheHome.vue'
import AddProductFrom from '@/components/AddProductFrom.vue'
import HistoryView from '@/components/HistoryView.vue'
import OrderDetailView from '@/components/OrderDetailView.vue'
import ManageAdmin from '@/components/ManageAdmin.vue'
import EditProduct from '@/components/EditProduct.vue'
import DeleteProduct from '@/components/DeleteProduct.vue'
import ManageRoles from '@/components/ManageRoles.vue'
import ViewMembers from '@/components/ViewMembers.vue'
import AdminOrderHistory from '@/components/AdminOrderHistory.vue'
const routes = [
  {
    path: '/product',
    name: 'product',
    component: TheProduct,
  },
  {
    path: '/login',
    name: 'Login',
    component: TheLogin,
  },
  {
    path: '/regist',
    name: 'Register',
    component: TheRegister,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
  },
  {
    path: '/editprofile',
    name: 'EditProfile',
    component: EditProfile,
  },
  {
    path: '/admin',
    name: 'Manage',
    component: ManageAdmin,
  },
  {
    path: '/admin/products/add',
    name: 'AddProduct',
    component: AddProductFrom,
  },
  {
    path: '/cart',
    name: 'CartList',
    component: CartView,
  },
  {
    path: '/cart/:id',
    name: 'CartDetail',
    component: CartViewDtl,
    props: true,
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetailView,
    props: true,
  },
  {
    path: '/',
    name: 'home',
    component: TheHome,
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryView,
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: OrderDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: ManageAdmin,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/products/add',
    name: 'AdminAddProduct',
    component: AddProductFrom,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/products/edit',
    name: 'AdminEditProduct',
    component: EditProduct,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/products/delete',
    name: 'AdminDeleteProduct',
    component: DeleteProduct,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/members/roles',
    name: 'AdminManageRoles',
    component: ManageRoles,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/members/list',
    name: 'AdminViewMembers',
    component: ViewMembers,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/orders',
    name: 'AdminOrderHistory',
    component: AdminOrderHistory,
    meta: { requiresAdmin: true },
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
export default router
