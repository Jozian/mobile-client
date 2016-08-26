var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var platform = process.env.platform || 'uap';
var BomPlugin = require('webpack-utf8-bom');


module.exports = {
  devtool: false,
  entry: ['babel-polyfill', './index'],

  output: {
    path: path.join(__dirname, '../shared'),
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new BomPlugin(true)
  ],
  resolve: {
    extensions: ['', '.js'],
    root: __dirname,
    alias: {
      ie: 'component-ie',
      'helpers/platform/fs': 'helpers/platform/' + platform + '/fs',
      'helpers/platform/gps': 'helpers/platform/' + platform + '/gps',
      'helpers/platform/ui': 'helpers/platform/' + platform + '/ui',
      'helpers/platform/storage': 'helpers/platform/' + platform + '/storage',
      'helpers/platform/credentials': 'helpers/platform/' + platform + '/credentials',
      'helpers/platform/camera': 'helpers/platform/' + platform + '/camera',
      'helpers/platform/cameraPlugin': 'helpers/platform/' + platform + '/cameraPlugin',
    }
  },
  module: {
    loaders: [
      { test: /\.js?$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.png?$/, loader: 'file' },
      {
        test: /\.scss$/,
        loaders: [
          'style',
          'css?modules&importLoaders=1&sourceMap&localIdentName=[local]___[hash:base64:5]',
          'postcss',
          'sass?outputStyle=expanded&sourceMap'
        ]
      },
      {
          test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
          loader: 'null-loader'
      }
    ]
  },
  postcss: [ autoprefixer({ browsers: ['last 2 versions', 'ie 10'] }) ],
  watch: true
};
