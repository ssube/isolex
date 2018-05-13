const { resolve } = require('path');
const { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const tsconfig = require('./tsconfig');

const path = {
  root: resolve(process.env.ROOT_PATH),
  source: resolve(process.env.SOURCE_PATH),
  target: resolve(process.env.TARGET_PATH),
  test: resolve(process.env.TEST_PATH),
  vendor: resolve(process.env.VENDOR_PATH)
};

const modulePath = {
  index: resolve(path.source, 'index'),
  harness: resolve(path.test, 'harness'),
  shim: resolve(path.source, 'shim')
};

// if `make test-check` was run, type check during lint (takes _forever_)
const typeCheck = process.env['TEST_CHECK'] === 'true';

module.exports = {
  devtool: 'source-map',
  entry: {
    main: modulePath.index,
    test: [modulePath.harness, 'sinon', 'chai']
  },
  externals: {
    'uws': 'commonjs uws',
    'sqlite3': 'commonjs sqlite3'
  },
  mode: 'none',
  module: {
    noParse: [
      /dtrace-provider/
    ],
    rules: [{
      test: /\.tsx?$/,
      rules: [{
        enforce: 'pre',
        use: [{
          loader: 'tslint-loader',
          options: {
            configFile: 'config/tslint.json',
            typeCheck
          }
        }]
      }, {
        use: [{
          loader: 'awesome-typescript-loader',
          options: {
            configFileName: 'config/tsconfig.json',
            inlineSourceMap: false,
            sourceMap: true
          }
        }]
      }]
    }]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    filename: '[name]-bundle.js',
    hashDigest: 'base64',
    hashFunction: 'sha256',
    path: path.target
  },
  plugins: [
    new CheckerPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      generateStatsFile: true,
      openAnalyzer: false,
      reportFilename: 'bundles.html'
    })
  ],
  resolve: {
    alias: [{
      name: 'erlpack',
      alias: modulePath.shim
    }, {
      name: 'ffmpeg-binaries',
      alias: modulePath.shim
    }, {
      name: 'handlebars',
      alias: 'handlebars/dist/handlebars'
    }, {
      name: 'mongodb',
      alias: modulePath.shim
    }, {
      name: 'mssql',
      alias: modulePath.shim
    }, {
      name: 'mysql',
      alias: modulePath.shim
    }, {
      name: 'mysql2',
      alias: modulePath.shim
    }, {
      name: 'node-opus',
      alias: modulePath.shim
    }, {
      name: 'opusscript',
      alias: modulePath.shim
    }, {
      name: 'oracledb',
      alias: modulePath.shim
    }, {
      name: 'pg',
      alias: modulePath.shim
    }, {
      name: 'pg-native',
      alias: modulePath.shim
    }, {
      name: 'pg-query-stream',
      alias: modulePath.shim
    }, {
      name: 'pty.js',
      alias: modulePath.shim
    }, {
      name: 'react-native-sqlite-storage',
      alias: modulePath.shim
    }, {
      name: 'redis',
      alias: modulePath.shim
    }, {
      name: 'src',
      alias: path.source,
      onlyModule: false
    }, {
      name: 'term.js',
      alias: modulePath.shim
    }, {
      name: 'test',
      alias: path.test,
      onlyModule: false
    }, {
      name: 'vendor',
      alias: path.vendor,
      onlyModule: false
    }],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    plugins: [
      new TsConfigPathsPlugin({ tsconfig, compiler: 'typescript' })
    ]
  },
  target: 'node'
};