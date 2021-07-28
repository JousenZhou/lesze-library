module.exports = {
    title: 'lesze-Document',
    components: 'src/components/**/index.vue',
    defaultExample: false,
    ribbon: {
        text: '返回百度',
        url: `www.baidu.com`
    },
    webpackConfig: require('./webpack.config.js'),
    exampleMode: 'expand',
    version: 'v1.0.0',
    copyCodeButton: true,
    getExampleFilename(componentPath) {
        return componentPath.replace(/index\.vue?$/, 'examples.md')
    }
};
