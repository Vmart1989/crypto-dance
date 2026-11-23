/** @type {import('next-sitemap').IConfig} */
const siteUrl = "https://www.cryptodance.app";
const locales = ["en", "es", "fr", "de"];
const coins = [
  "bitcoin", "ethereum", "tether", "solana", "xrp", "binance-coin",
  "usd-coin", "cardano", "dogecoin", "tron", "chainlink", "avalanche",
  "sui", "shiba-inu", "polkadot", "dai", "pepe", "official-trump",
  "cronos-com-coin", "arbitrum", "bonk1", "floki-inu", "steth", "stellar",
];

const localizedPath = (path, locale) => {
  const prefix = locale === "en" ? "" : `/${locale}`;
  return path === "/" ? prefix || "/" : `${prefix}${path}`;
};

const alternates = (path) => [
  ...locales.map((hreflang) => ({ hreflang, href: `${siteUrl}${localizedPath(path, hreflang) === "/" ? "" : localizedPath(path, hreflang)}`, hrefIsAbsolute: true })),
  { hreflang: "x-default", href: siteUrl + (path === "/" ? "" : path), hrefIsAbsolute: true },
];

const entry = (path, locale, priority = 0.7) => ({
  loc: localizedPath(path, locale),
  changefreq: path.startsWith("/coin/") ? "daily" : "weekly",
  priority,
  lastmod: new Date().toISOString(),
  alternateRefs: alternates(path),
});

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  exclude: ["/admin", "/admin/*", "/dashboard", "/dashboard/*", "/api/*"],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/api"] }],
  },
  additionalPaths: async () => {
    const publicPaths = ["/", "/guide", "/register", ...coins.map((coin) => `/coin/${coin}`)];
    return publicPaths.flatMap((path) => locales.map((locale) => entry(path, locale, path === "/" ? 1 : path === "/register" ? 0.8 : 0.7)));
  },
  transform: async (config, path) => ({
    loc: path,
    changefreq: path.startsWith("/coin/") ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
    lastmod: new Date().toISOString(),
    alternateRefs: alternates(path),
  }),
};
