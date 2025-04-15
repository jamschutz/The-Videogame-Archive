const { merge } = require('webpack-merge');
const base = require('./webpack.config.base.js');

module.exports = merge(base, {
    mode: 'production',
    output: {
        path: '/srv/www/code'
    }
});