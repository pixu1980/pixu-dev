import DefaultLayout from '~/layouts/Default.vue';
import VueScrollTo from 'vue-scrollto';
import head from './head.js';
import './icons.js';
import './assets/styles/main.scss';

import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome';

export default function (Vue, {
  head: vueHead,
}) {
  head(vueHead);
  
  Vue.use(VueScrollTo)
  Vue.component('font-awesome', FontAwesomeIcon)
  Vue.component('Layout', DefaultLayout)
}
