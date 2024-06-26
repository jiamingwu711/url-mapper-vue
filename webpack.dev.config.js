const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const VUE_VERSION = process.env.VUE_VERSION || 2
const examplesPath = `./examples/vue${VUE_VERSION}`

module.exports = {
  entry: `${examplesPath}/index.js`,
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: `examples_${VUE_VERSION}.js`,
  },
  plugins: [new HtmlWebpackPlugin({
    filename: `index_${VUE_VERSION}.html`,
    template: path.resolve(__dirname, `${examplesPath}/index.html`),
  })],

  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
    open: `index_${VUE_VERSION}.html`
  },
};