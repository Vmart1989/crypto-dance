/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://cryptodance.app', //
    generateRobotsTxt: true, // generate robots.txt 
    sitemapSize: 7000, 
    exclude: ['/admin', '/admin/*', '/dashboard', '/dashboard/*'],


    additionalPaths: async (config) => [
        {
          loc: `${config.siteUrl}/coin/bitcoin`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.8,
        },
        {
          loc: `${config.siteUrl}/coin/ethereum`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.8,
        },
        {
          loc: `${config.siteUrl}/coin/tether`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.8,
        },
        {
          loc: `${config.siteUrl}/coin/solana`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.8,
        },

        {
            loc: `${config.siteUrl}/coin/xrp`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

        {
          loc: `${config.siteUrl}/coin/binance-coin`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.8,
        },

        {
            loc: `${config.siteUrl}/coin/usd-coin`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/cardano`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/dogecoin`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/tron`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/chainlink`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/avalanche`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/sui`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/shiba-inu`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/polkadot`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/dai`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/pepe`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/official-trump`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/cronos-com-coin`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/arbitrum`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/bonk1`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/floki-inu`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/binance-coin`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/steth`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },

          {
            loc: `${config.siteUrl}/coin/stellar`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
          },


    ],
  };
  