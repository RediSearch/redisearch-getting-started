import Vue from 'vue'
import VueRouter from 'vue-router'
import Search from '../views/Search.vue'
import FacetedSearch from '../views/FacetedSearch.vue'
import Home from '../views/Home.vue'
import MovieForm from '../views/MovieForm.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
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
  },
  {
    path: '/movies/:id',
    name: 'MovieForm',
    component: MovieForm
  }
  ]

const router = new VueRouter({
  routes
})

export default router
