var path = require('path');

module.exports = {
    entry: {
        bundle: './js/app.js',
    },
    output: {
        filename: './js/bundle.js',
        pathinfo: true
    },
    resolve: {
        alias: {
            'jquery-widget': path.resolve('../../dist/jquery-widget'),
        },
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loader: 'babel',
                query: {
                    'plugins': [
                        ['transform-react-jsx', {
                            'pragma': 'this.createWidget'
                        }]
                    ]
                }
            }
        ]
    }
};
