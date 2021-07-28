import Vue from 'vue';
import App from './App.vue';
import './plugins';
import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/base.css';
import 'element-ui/lib/theme-chalk/progress.css';
Vue.use(ElementUI);
new Vue({
    el: '#app',
    render: (h) => h(App)
});
