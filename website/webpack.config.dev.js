const { merge } = require('webpack-merge');
const base = require('./webpack.config.base.js');
const path = require('path');

module.exports = merge(base, {
    mode: 'development',
    watch: true,
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '_site/code')
    }
})