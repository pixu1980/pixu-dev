module.exports = {
  siteName: 'Pixu Resume',
  siteDescription: 'Emiliano Pisu - UI/UX Engineer - Resume',
  siteUrl: 'https://pixu.dev',
  icon: false,
  plugins: [{
      use: '@gridsome/plugin-sitemap',
      options: {
        cacheTime: 600000
      }
    }
  ],
  css: {
    loaderOptions: {
      scss: {}
    }
  }
}
