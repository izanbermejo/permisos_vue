const { defineConfig } = require('@vue/cli-service')
//const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'development' ? '/' : '/comercial',
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          openAnalyzer: false
        })
      )
    }

    config.output.chunkFilename = '[name].[chunkhash].js'
    config.output.pathinfo = false
  },
})
