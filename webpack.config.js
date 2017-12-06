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
                // query: {
                //     presets: ['es2015', 'stage-1']
                // }
            },
        ]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        // new webpack.DefinePlugin({
        //     'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) },
        //     __CLIENT__: JSON.stringify(true),
        //     __SERVER__: JSON.stringify(false),
        // }),
        // // Minimize all JavaScript output of chunks
        // // https://github.com/mishoo/UglifyJS2#compressor-options
        // new webpack.optimize.UglifyJsPlugin({
        //     minimize: true,
        //     compress: {
        //         warnings: false,
        //         drop_console: true,
        //         screw_ie8: true
        //     },
        //     output: {
        //         comments: false
        //     }
        // }),
    ]
}