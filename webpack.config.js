/**
 * Created by therfaint- on 31/07/2017.
 */
import path from 'path';
import webpack from 'webpack';
import fs from 'fs';
import uglifycss from 'uglifycss';

const NODE_MODULES_PATH = path.resolve(__dirname, './node_modules');

const writeFile = (file, contents) => new Promise((resolve, reject) => {
    fs.writeFile(file, contents, 'utf8', err => (err ? reject(err) : resolve()));
});

writeFile(path.resolve(__dirname, './public/tdim.min.css'), uglifycss.processFiles(
    [path.resolve(__dirname, './public/tdim.css')],
    {maxLineLen: 0, expandVars: true}
)).then(res => console.log('css压缩成功'))

module.exports = {

    entry: path.resolve(__dirname, './app/index.js'),

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
                exclude: NODE_MODULES_PATH
            },
        ]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false,
                drop_console: true,
                screw_ie8: true
            },
            output: {
                comments: false
            }
        })
    ]
};