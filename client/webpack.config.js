const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DashboardPlugin = require('webpack-dashboard/plugin')
const webpack = require('webpack')

const srcDir = path.resolve(__dirname, 'src')

module.exports = {
  devtool: 'source-map',
  entry: [
    'react-hot-loader/patch',
    'webpack/hot/only-dev-server',
    `${srcDir}/index.js`
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              camelCase: true,
              localIdentName: '[name]__[local]__[hash:base64:6]',
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
    new DashboardPlugin(),
    new webpack.HotModuleReplacementPlugin({})
  ],
  devServer: {
    historyApiFallback: true,
    hot: true
  }
}
