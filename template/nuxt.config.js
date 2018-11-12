const webpack = require('webpack')
const fs = require('fs-extra')
const morgan = require('morgan')
const rfs = require('rotating-file-stream')
const logDirectory = './logs'

// ensure log directory exists
fs.existsSync(logDirectory) || fs.ensureDirSync(logDirectory)

// create a rotating write stream
const accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
})

module.exports = {
  head: {
    htmlAttrs: {
      lang: 'en'
    },
    titleTemplate: '{{ name }} | %s',
    title: 'Welcome',
    noscript: [{ innerHTML: 'This website requires JavaScript.' }],
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '{{escape description }}' },
      { hid: 'og:site_name', property: 'og:site_name', content: '{{ name }}' },
      { hid: 'og:image', property: 'og:image', content: '' },
      { hid: 'og:title', property: 'og:title', content: '{{ name }}' },
      { hid: 'og:description', property: 'og:description', content: '{{escape description }}' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  css: [
    { src: '~assets/css/main.scss', lang: 'scss' }
  ],

  sitemap: {
    path: '/sitemap.xml',
    hostname: '{{ websiteUrl }}',
    cacheTime: 1000 * 60 * 15,
    gzip: true,
    generate: false,
    routes: [ '/' ]
  },

  serverMiddleware: [morgan('combined', { stream: accessLogStream })],

  router: {
    middleware: ['i18n', 'browser-specs', 'contentful'],
    scrollBehavior(to, _from, savedPosition) {
      // if the returned position is falsy or an empty object,
      // will retain current scroll position.
      let position = false

      // if no children detected
      if (to.matched.length < 2) {
        // scroll to the top of the page
        position = { x: 0, y: 0 }
      } else if (
        to.matched.some(r => r.components.default.options.scrollToTop)
      ) {
        // if one of the children has scrollToTop option set to true
        position = { x: 0, y: 0 }
      }

      // savedPosition is only available for popstate navigations (back button)
      if (savedPosition) {
        position = savedPosition
      }

      return new Promise(resolve => {
        // wait for the out transition to complete (if necessary)
        window.$nuxt.$once('triggerScroll', () => {
          // coords will be used if no selector is provided,
          // or if the selector didn't match any element.
          if (to.hash && document.querySelector(to.hash)) {
            // scroll to anchor by returning the selector
            position = { selector: to.hash }
          }
          resolve(position)
        })
      })
    }
  },

  loading: { color: '#3B8070' },

  plugins: [
    { src: '~/plugins/i18n' }
  ],

  modules: [
    ['nuxt-sass-resources-loader', '@/assets/css/variables.scss'],
    '@nuxtjs/sitemap'
  ],

  build: {
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    },

    plugins: [
      new webpack.ProvidePlugin({
        _: 'lodash'
      })
    ]
  }
}
