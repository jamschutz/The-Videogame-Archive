const { merge } = require('webpack-merge');
const base = require('./webpack.config.base.js');
const path = require('path');

module.exports = merge(base, {
    mode: 'production',
    output: {
        path: path.resolve(__dirname, '_site/code')
    }
});