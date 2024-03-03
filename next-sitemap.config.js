module.exports = {
  siteUrl: process.env.SITE_URL || 'https://torrents.youplex.site',
  generateRobotsTxt: true, // (optional)
  // ...other options
  exclude: ['/server-sitemap.xml'],
  robotsTxtOptions: {
    additionalSitemaps: [
      `https://torrents.youplex.site/server-sitemap.xml`, // <==== Add here
    ],
  },
};
