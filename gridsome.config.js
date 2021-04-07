module.exports = {
  siteName: 'Pixu Resume',
  siteDescription: 'Emiliano Pisu - UI/UX Engineer - Resume',
  siteUrl: 'https://pixu.dev',
  plugins: [{
      use: '@gridsome/plugin-google-analytics',
      options: {
        id: 'UA-XXXXXXXX-XX'
      }
    },
    {
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
