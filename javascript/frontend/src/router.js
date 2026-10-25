import { createRouter, createWebHistory } from 'vue-router'
import { auth } from './state/auth.js'
import CartView from './views/CartView.vue'
import CatalogView from './views/CatalogView.vue'
import CheckoutView from './views/CheckoutView.vue'
import LoginView from './views/LoginView.vue'
import OrderConfirmView from './views/OrderConfirmView.vue'
import OrdersView from './views/OrdersView.vue'
import ProductView from './views/ProductView.vue'
import RegisterView from './views/RegisterView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'catalog', component: CatalogView },
    { path: '/kategoria/:slug', name: 'category', component: CatalogView },
    { path: '/produkt/:slug', name: 'product', component: ProductView },
    { path: '/koszyk', name: 'cart', component: CartView },
    { path: '/logowanie', name: 'login', component: LoginView },
    { path: '/rejestracja', name: 'register', component: RegisterView },
    {
      path: '/zamowienie',
      name: 'checkout',
      component: CheckoutView,
      meta: { requiresUser: true },
    },
    {
      path: '/zamowienie/potwierdzenie',
      name: 'order-confirm',
      component: OrderConfirmView,
      meta: { requiresUser: true },
    },
    {
      path: '/konto/zamowienia',
      name: 'orders',
      component: OrdersView,
      meta: { requiresUser: true },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.meta.requiresUser && !auth.user) {
    return { path: '/logowanie', query: { next: to.fullPath } }
  }

  return true
})

router.afterEach(() => {
  document.title = 'EMarket'
})
