const path = require('path');

module.exports = {
  entry: './client/src/App.jsx',
  output: {
    path: path.join(__dirname, './client/dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',

        },
      },
    ],
  },
};