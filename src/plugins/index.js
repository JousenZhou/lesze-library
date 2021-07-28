import svgIcon from './svg-icon/index.js';
import Vue from 'vue';
Vue.use(svgIcon, require.context(`../svg`, false, /\.svg$/));
