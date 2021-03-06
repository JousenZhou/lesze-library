const path = require('path');
const webpack = require('webpack');
const resolve = (dir) => path.join(__dirname, './', dir);
const VueLoaderPlugin = require('vue-loader/lib/plugin');
module.exports = {
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: 'build.js'
    },
    plugins: [new VueLoaderPlugin()],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader']
            },
            {
                test: /\.scss$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.sass$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader?indentedSyntax']
            },
            {
                test: /\.md$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'vue-loader', // 这里的使用的最新的 v15 版本
                        options: {
                            compilerOptions: {
                                preserveWhitespace: false
                            }
                        }
                    }
                ]
            },
            {
                test: /\.vue$/,
                use: [
                    {
                        loader: 'vue-loader',
                        options: {
                            loaders: {
                                // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                                // the "scss" and "sass" values for the lang attribute to the right configs here.
                                // other preprocessors should work out of the box, no loader config like this necessary.
                                scss: ['vue-style-loader', 'css-loader', 'sass-loader'],
                                sass: ['vue-style-loader', 'css-loader', 'sass-loader?indentedSyntax']
                            }
                            // other vue-loader options go here
                        }
                    }
                ]
            },
            {
                test: /\.(jsx|js)$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: (() => {
                    return {
                        presets: ['@vue/cli-plugin-babel/preset'],
                        plugins: [
                            '@babel/plugin-transform-runtime',
                            '@babel/plugin-transform-regenerator',
                            ['@babel/plugin-proposal-decorators', { legacy: true }]
                        ]
                    };
                })()
            },
            {
                test: /\.svg$/,
                include: [resolve('./src/svg')],
                use: [
                    {
                        loader: 'svg-sprite-loader',
                        options: {
                            symbolId: 'icon-[name]'
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                exclude: [resolve('./src/svg')],
                options: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    resolve: {
        alias: {
            vue$: 'vue/dist/vue.esm.js'
        },
        extensions: ['*', '.js', '.vue', '.json']
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true,
        overlay: true
    },
    performance: {
        hints: false
    },
    devtool: '#eval-source-map'
};
if (process.env.NODE_ENV === 'production') {
    // module.exports.devtool = '#source-map';
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        })
        // new webpack.LoaderOptionsPlugin({
        //     minimize: true
        // })
    ]);
    // module.exports.optimization = {
    //     minimizer: [new UglifyJsPlugin()]
    // };
}
