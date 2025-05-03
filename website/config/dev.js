const { merge } = require('webpack-merge');
const base = require('./base.js');

module.exports = merge(base, {
    API_BASE_URL: "http://localhost:5000",
    IMG_BASE_URL: "http://localhost:5001/img",
})