const { resolve } = require('path');
const { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader');
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

function ignoreModules(names) {
  return names.map((it) => new webpack.IgnorePlugin(it));
}

// ignore warnings for libraries with a dynamic include
// that cannot be excluded at the module level
// or will not be fixed by the library (shame)
function ignoreWarnings(warn) {
  if (/Critical dependency/.test(warn)) {
    return (
      /yargs-parser/.test(warn) ||
      /express\/lib\/view.js/.test(warn) ||
      /discord.js\/src\/client\/voice\/util\/Secretbox.js/.test(warn) ||
      /typeorm\/platform\/PlatformTools.js/.test(warn)
    );
  }
  return false;
}

module.exports = {
  devtool: 'source-map',
  entry: {
    main: modulePath.index,
    test: [modulePath.harness, 'sinon', 'chai']
  },
  externals: {
    'jsonpath': 'commonjs jsonpath',
    'uws': 'commonjs uws',
    'sqlite3': 'commonjs sqlite3'
  },
  mode: 'none',
  module: {
    noParse: [
      /dtrace-provider/
    ],
    rules: [{
      test: /\.yml$/,
      rules: [{
        use: ['json-loader', 'yaml-loader']
      }]
    }, {
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
            sourceMap: true,
            useCache: true,
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
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static',
    //   generateStatsFile: true,
    //   openAnalyzer: false,
    //   reportFilename: 'bundles.html'
    // }),
    new webpack.DefinePlugin({
      // make sure to stringify these (handles quotes, escapes, etc)
      BUILD_JOB: JSON.stringify(process.env['CI_JOB_ID']),
      BUILD_RUNNER: JSON.stringify(process.env['CI_RUNNER_ID']),
      GIT_BRANCH: JSON.stringify(process.env['CI_COMMIT_REF_SLUG']),
      GIT_COMMIT: JSON.stringify(process.env['CI_COMMIT_SHA']),
      NODE_VERSION: JSON.stringify(process.env['NODE_VERSION']),
      RUNNER_VERSION: JSON.stringify(process.env['RUNNER_VERSION']),
      WEBPACK_VERSION: JSON.stringify(process.env['WEBPACK_VERSION']),
    }),
    ...ignoreModules([
      /^erlpack$/,
      /^ffmpeg-binaries$/,
      /^ioredis$/,
      /^mssql$/,
      /^mysql$/,
      /^mysql2$/,
      /^mongodb$/,
      /^node-opus$/,
      /^opusscript$/,
      /^oracledb$/,
      /^(pg|pg-.*)/,
      /^pty.js/,
      /^react-native-sqlite-storage$/,
      /^redis$/,
      /^sql.js$/,
      /^term.js$/
    ])
  ],
  resolve: {
    alias: [{
      name: 'handlebars',
      alias: 'handlebars/dist/handlebars'
    }, {
      name: 'src',
      alias: path.source,
      onlyModule: false
    }, {
      name: 'test',
      alias: path.test,
      onlyModule: false
    }, {
      name: 'vendor',
      alias: path.vendor,
      onlyModule: false
    }],
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json', '.gql'],
    plugins: [
      new TsConfigPathsPlugin({ tsconfig, compiler: 'typescript' })
    ]
  },
  stats: {
    warningsFilter: ignoreWarnings,
  },
  target: 'node'
};
