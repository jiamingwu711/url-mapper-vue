const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');


const examplesPath = `./examples/vue${process.env.VUE_VERSION || 2}`

module.exports = {
  entry: `${examplesPath}/index.js`,
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'examples.js',
  },
  plugins: [new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.resolve(__dirname, `${examplesPath}/index.html`),
  })],

  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
  },
};