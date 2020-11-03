const path = require('path');

module.exports = {
  entry: './client/src/App.jsx',
  output: {
    path: path.join(__dirname, './client/dist'),
    filename: 'bundle.js',
  },
  watchOptions: {
    poll: 1000 // Check for changes every second
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