const path = require('path');

module.exports = {
    entry: './src/code/entry.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'webpack.js',
        path: path.resolve(__dirname, '_site/code')
    }
}