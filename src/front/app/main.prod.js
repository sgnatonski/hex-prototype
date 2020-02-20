import Vue from 'vue';
import VueHeadful from 'vue-headful';
import { JL } from 'jsnlog';
import App from './app.vue';
import router from './router.js';

Vue.component('vue-headful', VueHeadful);

Vue.config.errorHandler = function(err, vm, info) { JL().error(err); }
Vue.config.warnHandler = function(msg, vm, info) { JL().warn(msg); }

new Vue({
  el: '#app',
  router,
  render: h => h(App),
});