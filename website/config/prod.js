const { merge } = require('webpack-merge');
const base = require('./base.js');

module.exports = merge(base, {
    API_BASE_URL: "/api",
    IMG_BASE_URL: "/archive/img",
})