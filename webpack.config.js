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
        ],
        loaders: [
            {
                test: /\.css$/,
                loader: 'style!css?sourceMap'
            },
            {
                test: /\.jsx$/,
                loader: 'babel',
                query: {
                    'plugins': [
                        ['transform-react-jsx', {
                            'pragma': 'this.createElement'
                        }]
                    ]
                }
            }
        ]
    },
    eslint: {
        configFile: './eslint.json'
    }
};
