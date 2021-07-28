export default {
    install: (Vue, svgFilePath) => {
        Vue.component('svg-icon', () => import('./index.vue'));
        let _ = svgFilePath.keys().map(svgFilePath);
    }
};
