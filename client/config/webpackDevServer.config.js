'use strict'

const paths = require('./paths')

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
const host = process.env.HOST || '0.0.0.0'

module.exports = function (proxy, allowedHost) {
  return {
    // Enable gzip compression of generated files.
    compress: true,

    // Serve static files from public folder
    static: [
      {
        directory: paths.appPublic,
        publicPath: '/',
        watch: true,
      },
    ],

    // Client configuration
    client: {
      logging: 'info',
      overlay: {
        errors: true,
        warnings: false,
      },
      progress: true,
    },

    // Enable hot module replacement
    hot: true,

    // Enable HTTPS if the HTTPS environment variable is set to 'true'
    server: protocol === 'https' ? 'https' : 'http',

    host: host,
    port: 3002,

    // History API fallback for SPA - don't apply to files with extensions
    historyApiFallback: {
      index: '/index.html',
      verbose: true,
      disableDotRule: false, // This is important - it prevents fallback for dotfiles
    },

    // Allowed hosts
    allowedHosts: allowedHost ? [allowedHost] : 'all',

    // Proxy configuration - forward /api requests to backend
    proxy: proxy || [
      {
        context: ['/api'],
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    ],

    // Setup middlewares
    setupMiddlewares: (middlewares, devServer) => {
      return middlewares
    },

    // Open browser on start
    open: false,
  }
}
