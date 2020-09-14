import Vue from 'vue'
import App from './App.vue'
import router from './router'

import { BootstrapVue } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import sampleQueries from "./lib/search-samples.json";

Vue.use(BootstrapVue);


Vue.config.productionTip = false

Vue.prototype.$sampleQueries = sampleQueries;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
