// let a = require('@babel/plugin-transform-runtime');
// let b = require('@babel/plugin-transform-regenerator');

module.exports = {
    title: 'lesze-Document',
    // components: 'src/components/**/index.vue',
    defaultExample: false,
    ribbon: {
        text: 'Github',
        url: `https://github.com/JousenZhou`
    },
    webpackConfig: require('./webpack.config.js'),
    exampleMode: 'collapse',
    tocMode: 'collapse',
    version: 'v1.0.0',
    copyCodeButton: true,
    getExampleFilename(componentPath) {
        return componentPath.replace(/index\.vue?$/, 'examples.md');
    },
    sections: [
        {
            name: '组件',
            components: 'src/components/**/index.vue'
        }
    ],
    compilerConfig: {
        objectAssign: 'Object.assign',
        transforms: {
            // make async/await work by default (no transforms)
            asyncAwait: false
        }
    }
};
