const klawSync = require('klaw-sync');
const path = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const paths = require('react-scripts-ts/config/paths');

function findEntries() {
  const packageJson = require(path.resolve(paths.appPath, 'package.json'));
  const entryDir = path.resolve(paths.appPath, packageJson.entryDir ? packageJson.entryDir : 'src/entries');
  return klawSync(entryDir, { nodir: true })
    .filter(file => {
      return file.path.endsWith('.ts') || file.path.endsWith('.tsx');
    })
    .map(file => {
      const relPath = path.relative(entryDir, file.path);
      const name = relPath.replace(/(\.tsx?)$/, '');
      return {
        path: file.path,
        name: name,
      };
    })
    .reduce((acc, entry) => {
      acc[entry.name] = entry.path;
      return acc;
    }, {});
}

module.exports = function transformWebpackConfig(config, isProd) {
  const entries = findEntries();

  // Add entries
  config.entry = Object.assign(
    {
      main: config.entry,
    },
    Object.keys(entries).reduce((acc, bundle) => {
      acc[bundle] = [require.resolve('react-dev-utils/webpackHotDevClient'), entries[bundle]];
      return acc;
    }, {})
  );

  config.output.library = 'Bundle';
  if (isProd) {
    config.output.filename = 'static/js/[name].[chunkhash:8].js';
    config.output.chunkFilename = 'static/js/[name].[chunkhash:8].chunk.js';
  } else {
    config.output.filename = 'static/js/[name].[hash:8].js';
    config.output.chunkFilename = 'static/js/[name].[hash:8].chunk.js';
  }

  config.resolve.plugins.unshift(new TsConfigPathsPlugin({ configFileName: paths.appTsConfig }));

  // Remove CSS rules because we use styled-components
  config.module.rules = config.module.rules.map(rule => {
    if (rule.oneOf) {
      rule.oneOf = rule.oneOf.filter(orule => {
        if (orule.test && orule.test.toString() === '/.css$/') {
          return false;
        }
        return true;
      });
    }
    return rule;
  });
  HtmlWebpackPlugin;
  config.plugins = config.plugins
    .map(plugin => {
      // We only include the `main` bundle in HtmlWebpackPlugin
      if (plugin instanceof HtmlWebpackPlugin) {
        return new HtmlWebpackPlugin({
          inject: true,
          template: paths.appHtml,
          chunks: ['main'],
        });
      }
      return plugin;
    })
    .filter(plugin => {
      // We remove ExtractTextPlugin
      if (plugin instanceof ExtractTextPlugin) {
        return false;
      }
      return true;
    });

  if (isProd === false) {
    // We add Manifest in dev
    config.plugins.push(
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
      })
    );
  }

  return config;
};
