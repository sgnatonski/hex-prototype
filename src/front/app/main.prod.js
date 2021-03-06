import Vue from 'vue';
import { JL } from 'jsnlog';
import vueInit from './vue.init';
import router from './router.js';

Vue.config.errorHandler = function(err, vm, info) { JL().error(err); }
Vue.config.warnHandler = function(msg, vm, info) { JL().warn(msg); }

vueInit(router);