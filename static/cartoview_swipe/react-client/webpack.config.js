var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'dist/');
var APP_DIR = path.resolve(__dirname, 'src/');

let newJSX = APP_DIR + '/new.jsx'
let editJSX = APP_DIR + '/edit.jsx'
let viewJSX = APP_DIR + '/view.jsx'

var config = {
  context: __dirname,
  entry: {
    newAppInstance: newJSX,
    editAppInstance: editJSX,
    viewAppInstance: viewJSX,
  },
  module: {
    loaders: [{
        test: /\.jsx?/,
        include: APP_DIR,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      }
    ]
  },
  output: {
    path: BUILD_DIR,
    filename: "[name].js"
  },
  devtool: "source-map"
};

module.exports = config;