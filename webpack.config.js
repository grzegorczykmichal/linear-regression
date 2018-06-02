const path = require('path');

module.exports = {
    mode: 'development',
    entry: "./src/app.js",
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    stats: {
        colors: true
    }
}