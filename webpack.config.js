const path = require('path')
const TerserPlugin = require('terser-webpack-plugin');

// const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  experiments: { outputModule: true },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    library: {
      type: 'module'
    },
    environment: { module: true }
  },
  module: {
    // rules: [
    //   {
    //     test: /\.js$/,
    //     exclude: /node_modules/,
    //     use: {
    //       loader: 'babel-loader',
    //       options: {
    //         presets: ['@babel/preset-env']
    //       }
    //     }
    //   }
    // ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false
          }
        },
        extractComments: false
      })
    ]
  },
  mode: 'production'
}