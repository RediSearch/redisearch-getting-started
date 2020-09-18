import Vue from 'vue'
import VueRouter from 'vue-router'
import Search from '../views/Search.vue'
import FacetedSearch from '../views/FacetedSearch.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Search
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/faceted-search',
    name: 'FacetedSearch',
    component: FacetedSearch
  }
  ]

const router = new VueRouter({
  routes
})

export default router
