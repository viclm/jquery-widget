module.exports = {
    entry: {
        bundle: './src/index.js',
    },
    output: {
        filename: './dist/jquery-widget.js',
        pathinfo: true,
        library: 'createElement',
        libraryTarget: 'umd'
    },
    externals: ['jquery'],
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: "eslint-loader"
            }
        ]
    },
    eslint: {
        configFile: './eslint.json'
    }
};
