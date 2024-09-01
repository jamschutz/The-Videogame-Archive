const path = require('path');

module.exports = {
    entry: {
        index: './src/code/index.ts',
        archive: './src/code/archive.ts',
        search: './src/code/search.ts'
    },
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
        filename: '[name].js',
        path: path.resolve(__dirname, '_site/code')
    }
}