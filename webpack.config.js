/**
 * Created by therfaint- on 31/07/2017.
 */
var path = require('path');
var webpack = require('webpack');
var NODE_MODULES_PATH = path.resolve(__dirname, './node_modules');

module.exports = {

    entry: path.resolve(__dirname, './app/main.js'),

    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'bundle.js',
    },

    module: {
        loaders: [
            {
                test: /\.css/,
                loaders: [
                    'style-loader',
                    'css-loader'
                ],

            },
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                exclude: NODE_MODULES_PATH,
                query: {
                    presets: ['es2015', 'react', 'stage-1']
                }
            },
        ]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
}