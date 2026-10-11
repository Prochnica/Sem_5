import { createRouter, createWebHistory } from 'vue-router'
import { session } from './state/session.js'
import AdminCategoriesView from './views/AdminCategoriesView.vue'
import AdminProductFormView from './views/AdminProductFormView.vue'
import AdminProductsView from './views/AdminProductsView.vue'
import CartView from './views/CartView.vue'
import CatalogView from './views/CatalogView.vue'
import CheckoutView from './views/CheckoutView.vue'
import DeniedView from './views/DeniedView.vue'
import LoginView from './views/LoginView.vue'
import OrderConfirmView from './views/OrderConfirmView.vue'
import OrdersView from './views/OrdersView.vue'
import ProductView from './views/ProductView.vue'
import RegisterView from './views/RegisterView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'catalog', component: CatalogView, meta: { title: 'Towary' } },
    { path: '/kategoria/:slug', name: 'category', component: CatalogView, meta: { title: 'Kategoria' } },
    { path: '/produkt/:slug', name: 'product', component: ProductView, meta: { title: 'Towar' } },
    { path: '/koszyk', name: 'cart', component: CartView, meta: { title: 'Koszyk' } },
    { path: '/logowanie', name: 'login', component: LoginView, meta: { title: 'Logowanie' } },
    { path: '/rejestracja', name: 'register', component: RegisterView, meta: { title: 'Rejestracja' } },
    {
      path: '/zamowienie',
      name: 'checkout',
      component: CheckoutView,
      meta: { title: 'Zamówienie', requiresUser: true },
    },
    {
      path: '/zamowienie/potwierdzenie',
      name: 'order-confirm',
      component: OrderConfirmView,
      meta: { title: 'Potwierdzenie', requiresUser: true },
    },
    {
      path: '/konto/zamowienia',
      name: 'orders',
      component: OrdersView,
      meta: { title: 'Zamówienia', requiresUser: true },
    },
    {
      path: '/admin/produkty',
      name: 'admin-products',
      component: AdminProductsView,
      meta: { title: 'Produkty', requiresAdmin: true },
    },
    {
      path: '/admin/produkty/nowy',
      name: 'admin-product-new',
      component: AdminProductFormView,
      meta: { title: 'Nowy produkt', requiresAdmin: true },
    },
    {
      path: '/admin/produkty/:id',
      name: 'admin-product-edit',
      component: AdminProductFormView,
      meta: { title: 'Edycja produktu', requiresAdmin: true },
    },
    {
      path: '/admin/kategorie',
      name: 'admin-categories',
      component: AdminCategoriesView,
      meta: { title: 'Kategorie', requiresAdmin: true },
    },
    { path: '/brak-dostepu', name: 'denied', component: DeniedView, meta: { title: 'Brak dostępu' } },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin) {
    if (!session.user) {
      return { path: '/logowanie', query: { next: to.fullPath } }
    }
    if (!session.user.isAdmin) {
      return { path: '/brak-dostepu' }
    }
  }

  if (to.meta.requiresUser && !session.user) {
    return { path: '/logowanie', query: { next: to.fullPath } }
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `EMarket - ${to.meta.title}` : 'EMarket'
})
