import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import Vuex from 'vuex';
import VueNativeSock from 'vue-native-websocket';
import store from './store';

Vue.config.productionTip = false;

Vue.use(Vuex);
Vue.use(VueNativeSock, 'ws://localhost:9000', {
  store: store,
  // format: 'json',
  connectManually: true
})

new Vue({
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
