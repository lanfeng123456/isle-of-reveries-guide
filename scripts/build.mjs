import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const contentDir = path.join(root, "content");
const config = JSON.parse(fs.readFileSync(path.join(root, "site.config.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(contentDir, "manifest.json"), "utf8"));

const categories = {
  guides: { label: "Guides", description: "Core mechanics, equipment and PC setup help.", seoDescription: "Browse reviewed Isle of Reveries guides for core mechanics, equipment pickups, puzzle solutions and PC controller troubleshooting." },
  dungeons: { label: "Dungeons", description: "Answers for specific dungeon blockers and rooms.", seoDescription: "Solve specific Isle of Reveries dungeon blockers with reviewed steps for Pilgrim’s Sanctum, Overgrown Shrine and their puzzle rooms." },
  bosses: { label: "Bosses", description: "Observed openings, tools and arena patterns.", seoDescription: "Find reviewed Isle of Reveries boss strategies for Fermata, Strix, Fiend-Shen, Cronos and the Arbiter of Reveries." }
};

const pages = manifest.pages.map((page) => ({
  ...page,
  category: page.url.split("/")[1],
  sourceFile: path.join(contentDir, page.file)
}));

const routeByFile = new Map(pages.map((page) => [path.basename(page.file), page.url]));

function assertInsideRoot(target) {
  const resolved = path.resolve(target);
  if (resolved !== dist && !resolved.startsWith(`${dist}${path.sep}`)) {
    throw new Error(`Refusing to write outside dist: ${resolved}`);
  }
}

assertInsideRoot(dist);
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";
}

function absoluteUrl(route) {
  return new URL(route, config.siteUrl).href;
}

function writeRoute(route, html) {
  const relative = route === "/" ? "index.html" : `${route.replace(/^\//, "")}index.html`;
  const target = path.join(dist, relative);
  assertInsideRoot(target);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, "utf8");
}

function iconMark() {
  return `<img class="brand-mark" src="/icon-512.png" width="32" height="32" alt="">`;
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url)
    }))
  };
}

function buildMetaKeywords(keywords, maxLength = 100) {
  const selected = [];
  for (const keyword of new Set(keywords.map((value) => String(value).trim()).filter(Boolean))) {
    const candidate = [...selected, keyword].join(", ");
    if ([...candidate].length <= maxLength) selected.push(keyword);
  }
  return selected.join(", ");
}

function layout({ title, description, keywords = [], canonical, body, structuredData = [], bodyClass = "", pageType = "website", robots = "index,follow" }) {
  const metaKeywords = buildMetaKeywords(keywords);
  const jsonLd = structuredData
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item).replaceAll("<", "\\u003c")}</script>`)
    .join("\n");
  const analytics = config.googleAnalyticsId
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.googleAnalyticsId)}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${escapeHtml(config.googleAnalyticsId)}');
  </script>`
    : "";
  const adSlot = `<section class="ad-slot" aria-label="Advertisement">
    <script async="async" data-cfasync="false" src="https://pl31263720.profitableratecpmnetwork.com/378c33620c3a82c82a3c97b58a404926/invoke.js"></script>
    <div id="container-378c33620c3a82c82a3c97b58a404926"></div>
  </section>`;
  return `<!doctype html>
<html lang="${config.language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${metaKeywords ? `<meta name="keywords" content="${escapeHtml(metaKeywords)}">` : ""}
  <meta name="robots" content="${escapeHtml(robots)}">
  <meta name="theme-color" content="${config.themeColor}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:type" content="${escapeHtml(pageType)}">
  <meta property="og:site_name" content="${escapeHtml(config.name)}">
  <meta property="og:image" content="${escapeHtml(absoluteUrl("/isle-of-reveries-official-gameplay.jpg"))}">
  <meta property="og:image:width" content="1920">
  <meta property="og:image:height" content="1080">
  <meta property="og:image:alt" content="Isle of Reveries official gameplay screenshot">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(absoluteUrl("/isle-of-reveries-official-gameplay.jpg"))}">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/assets/styles.css">
  ${analytics}
  ${jsonLd}
</head>
<body class="${escapeHtml(bodyClass)}">
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="/" aria-label="${escapeHtml(config.shortName)} home">${iconMark()}<span>${escapeHtml(config.shortName)}</span></a>
      <nav class="main-nav" aria-label="Primary navigation">
        <a href="/guides/">All guides</a>
        <a href="/dungeons/">Dungeons</a>
        <a href="/bosses/">Bosses</a>
        <a class="steam-link" href="https://store.steampowered.com/app/3100970/" target="_blank" rel="noopener noreferrer" aria-label="View Isle of Reveries on Steam (opens in a new tab)">Steam <span aria-hidden="true">↗</span></a>
      </nav>
    </div>
  </header>
  ${adSlot}
  ${body}
  <footer class="site-footer">
    <div class="footer-inner">
      <p><strong>${escapeHtml(config.name)}</strong></p>
      <p>Independent, evidence-linked help for Isle of Reveries. This site is not affiliated with the game’s developer or publisher.</p>
      <a href="/guides/">Browse all guides</a>
    </div>
  </footer>
</body>
</html>`;
}

function categoryBadge(category) {
  return `<span class="eyebrow">${escapeHtml(categories[category]?.label || "Guide")}</span>`;
}

function card(page, headingLevel = 3) {
  const heading = `h${headingLevel}`;
  return `<article class="guide-card">
    ${categoryBadge(page.category)}
    <${heading}><a href="${page.url}">${escapeHtml(page.title)}</a></${heading}>
    <p>${escapeHtml(page.seo_description)}</p>
    <a class="text-link" href="${page.url}" aria-label="Read guide: ${escapeHtml(page.title)}">Read guide <span aria-hidden="true">→</span></a>
  </article>`;
}

function homePage() {
  const featured = ["IOR-EXP-01", "IOR-EXP-03", "IOR-EXP-04", "IOR-EXP-10", "IOR-EXP-11", "IOR-EXP-12"]
    .map((id) => pages.find((page) => page.id === id))
    .filter(Boolean);
  const categoryCounts = Object.keys(categories).map((key) => ({
    key,
    count: key === "guides" ? pages.length : pages.filter((page) => page.category === key).length,
    ...(key === "guides" ? { label: "All guides", description: "Browse every reviewed puzzle, boss, item and setup page." } : categories[key])
  }));
  const body = `<main id="main-content">
    <section class="home-intro">
      <div class="intro-copy">
        <p class="kicker">Independent player guide</p>
        <h1>Find the next step in<br><em>Isle of Reveries</em></h1>
        <p class="lede">Focused answers for puzzle rooms, boss openings, equipment pickups and PC controller issues. Each guide states what the available evidence confirms—and where its route stops.</p>
        <div class="intro-actions">
          <a class="button primary" href="/guides/">Explore all 14 guides</a>
          <a class="button secondary" href="/guides/getting-started/">Start with early equipment</a>
        </div>
      </div>
      <figure class="game-visual">
        <img src="/isle-of-reveries-gameplay-960.webp" srcset="/isle-of-reveries-gameplay-480.webp 480w, /isle-of-reveries-gameplay-960.webp 960w" sizes="(max-width: 880px) calc(100vw - 24px), 520px" width="960" height="540" alt="Lief and their fairy companion exploring a blue-water shrine in Isle of Reveries" fetchpriority="high">
        <figcaption>Official game screenshot · <a href="https://store.steampowered.com/app/3100970/" target="_blank" rel="noopener noreferrer">View on Steam <span aria-hidden="true">↗</span></a></figcaption>
      </figure>
    </section>
    <section class="section-shell" aria-labelledby="route-heading">
      <div class="section-heading"><div><p class="kicker">Choose a route</p><h2 id="route-heading">Help by category</h2></div><p>Jump directly to the kind of blocker you are facing.</p></div>
      <div class="category-grid">${categoryCounts.map((category) => `<a class="category-tile" href="/${category.key}/"><span class="category-count">${category.count}</span><h3>${category.label}</h3><p>${category.description}</p></a>`).join("")}</div>
    </section>
    <section class="section-shell featured-section" aria-labelledby="featured-heading">
      <div class="section-heading"><div><p class="kicker">Useful checkpoints</p><h2 id="featured-heading">Start here</h2></div><a class="text-link" href="/guides/">View every guide →</a></div>
      <div class="card-grid">${featured.map((page) => card(page, 3)).join("")}</div>
      <p class="scene-credit">Background: official game screenshot · <a href="https://store.steampowered.com/app/3100970/" target="_blank" rel="noopener noreferrer">Steam <span aria-hidden="true">↗</span></a></p>
    </section>
    <section class="method-note"><div><p class="kicker">How these guides are written</p><h2>Direct answers, visible limits</h2></div><p>Steps are based on reviewed developer guidance and recorded play. A page covering one room or pickup says so clearly; it is not presented as a complete dungeon walkthrough.</p></section>
  </main>`;
  return layout({
    title: `${config.name} — Puzzles, Bosses & Equipment`,
    description: config.description,
    keywords: ["Isle of Reveries guide", "Isle of Reveries walkthrough", "Isle of Reveries puzzles", "Isle of Reveries bosses", "Isle of Reveries equipment"],
    canonical: absoluteUrl("/"),
    body,
    structuredData: [{
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: config.name,
      alternateName: config.shortName,
      url: absoluteUrl("/"),
      inLanguage: config.language
    }],
    bodyClass: "home"
  });
}

function listingPage(category = null) {
  const selected = category ? pages.filter((page) => page.category === category) : pages;
  const info = category ? categories[category] : { label: "All guides", description: "Every reviewed guide in one place.", seoDescription: "Browse all 14 reviewed Isle of Reveries guides covering puzzle rooms, boss fights, equipment, core mechanics and PC controller help." };
  const route = category ? `/${category}/` : "/guides/";
  const crumbs = category
    ? [{ name: "Home", url: "/" }, { name: info.label, url: route }]
    : [{ name: "Home", url: "/" }, { name: "All guides", url: route }];
  const body = `<main id="main-content" class="listing-page">
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>${escapeHtml(info.label)}</span></nav>
    <header class="listing-header"><p class="kicker">${selected.length} reviewed pages</p><h1>${escapeHtml(info.label)}</h1><p>${escapeHtml(info.description)}</p></header>
    ${!category ? `<nav class="filter-links" aria-label="Guide categories"><a class="active" href="/guides/">All</a><a href="/dungeons/">Dungeons</a><a href="/bosses/">Bosses</a></nav>` : ""}
    <div class="card-grid listing-grid">${selected.map((page) => card(page, 2)).join("")}</div>
  </main>`;
  return layout({
    title: category ? `Isle of Reveries ${info.label} Guides | ${config.shortName}` : `Isle of Reveries Guides: Puzzles, Bosses & Items`,
    description: info.seoDescription,
    keywords: category
      ? [`Isle of Reveries ${info.label.toLowerCase()}`, ...selected.slice(0, 5).map((page) => page.query)]
      : ["Isle of Reveries guides", "Isle of Reveries walkthrough", "Isle of Reveries puzzle guide", "Isle of Reveries boss guide", "Isle of Reveries items"],
    canonical: absoluteUrl(route),
    body,
    structuredData: [breadcrumbSchema(crumbs), {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${info.label} — ${config.name}`,
      numberOfItems: selected.length,
      itemListElement: selected.map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: page.title,
        url: absoluteUrl(page.url)
      }))
    }]
  });
}

function rewriteMarkdownLinks(markdown) {
  return markdown.replace(/\]\(([^)]+\.md)(#[^)]+)?\)/g, (match, file, hash = "") => {
    const route = routeByFile.get(path.basename(file));
    return route ? `](${route}${hash})` : match;
  });
}

function articlePage(page) {
  let markdown = fs.readFileSync(page.sourceFile, "utf8").replace(/^#\s+[^\r\n]+[\r\n]+/, "");
  markdown = rewriteMarkdownLinks(markdown);
  const headingLines = [...markdown.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].replace(/[*_`]/g, "").trim());
  let html = marked.parse(markdown);
  html = html.replace("<p>", '<p class="quick-answer">');
  html = html.replace(/<a href="(https?:\/\/[^\"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
  const usedIds = new Map();
  html = html.replace(/<h2>(.*?)<\/h2>/g, (_match, inner) => {
    const plain = inner.replace(/<[^>]+>/g, "");
    const base = slugify(plain);
    const count = usedIds.get(base) || 0;
    usedIds.set(base, count + 1);
    const id = count ? `${base}-${count + 1}` : base;
    return `<h2 id="${id}">${inner}</h2>`;
  });
  const toc = headingLines.length > 1 ? `<aside class="on-this-page" aria-label="On this page"><p>On this page</p><ol>${headingLines.map((heading, index) => {
    const base = slugify(heading);
    const previous = headingLines.slice(0, index).filter((item) => slugify(item) === base).length;
    const id = previous ? `${base}-${previous + 1}` : base;
    return `<li><a href="#${id}">${escapeHtml(heading)}</a></li>`;
  }).join("")}</ol></aside>` : "";
  const category = categories[page.category];
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: category.label, url: `/${page.category}/` },
    { name: page.title, url: page.url }
  ];
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.seo_title,
    description: page.seo_description,
    image: absoluteUrl("/isle-of-reveries-official-gameplay.jpg"),
    author: { "@type": "Organization", name: config.name, url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: config.name, url: absoluteUrl("/"), logo: { "@type": "ImageObject", url: absoluteUrl("/icon-512.png") } },
    datePublished: manifest.date,
    dateModified: page.reviewed_date || manifest.date,
    inLanguage: config.language,
    isAccessibleForFree: true,
    mainEntityOfPage: absoluteUrl(page.url)
  };
  const relatedPages = [];
  const requestedRelated = (page.internal_links || []).map((file) => pages.find((candidate) => path.basename(candidate.file) === path.basename(file))).filter(Boolean);
  for (const candidate of [...requestedRelated, ...pages.filter((candidate) => candidate.category === page.category), ...pages]) {
    if (candidate.id !== page.id && !relatedPages.some((item) => item.id === candidate.id)) relatedPages.push(candidate);
    if (relatedPages.length === 3) break;
  }
  const related = `<section class="related-guides" aria-labelledby="related-guides-heading"><h2 id="related-guides-heading">Related guides</h2><ul>${relatedPages.map((item) => `<li><a href="${item.url}">${escapeHtml(item.title)}</a></li>`).join("")}</ul></section>`;
  const body = `<main id="main-content" class="article-shell">
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/${page.category}/">${escapeHtml(category.label)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(page.title)}</span></nav>
    <article class="article-layout">
      <header class="article-header">
        ${categoryBadge(page.category)}
        <h1>${escapeHtml(page.title)}</h1>
        <p class="article-deck">${escapeHtml(page.seo_description)}</p>
        <div class="scope-box"><strong>Guide scope</strong><p>${escapeHtml(page.publishable_scope)}</p></div>
      </header>
      <div class="article-grid">
        <div class="article-content">${html}
          <aside class="evidence-note"><h2>Evidence note</h2><p>${escapeHtml(page.limitations)}</p><p>Reviewed ${escapeHtml(page.reviewed_date || manifest.date)} from the linked developer guidance and recordings; this was not a hands-on patch test.</p></aside>
          ${related}
        </div>
        ${toc}
      </div>
    </article>
  </main>`;
  return layout({
    title: page.seo_title.length < 50 ? `${page.seo_title} | ${config.shortName}` : page.seo_title,
    description: page.seo_description,
    keywords: [page.query, page.seo_title, `Isle of Reveries ${category.label.toLowerCase()}`],
    canonical: absoluteUrl(page.url),
    body,
    structuredData: [articleSchema, breadcrumbSchema(breadcrumbs)],
    pageType: "article",
    bodyClass: "article-page"
  });
}

writeRoute("/", homePage());
writeRoute("/guides/", listingPage());
writeRoute("/dungeons/", listingPage("dungeons"));
writeRoute("/bosses/", listingPage("bosses"));
for (const page of pages) writeRoute(page.url, articlePage(page));

const notFound = layout({
  title: `Page not found | ${config.name}`,
  description: "The requested guide could not be found.",
  canonical: absoluteUrl("/404.html"),
  body: `<main id="main-content" class="not-found"><p class="kicker">404</p><h1>This path faded from the map.</h1><p>The guide may have moved, or the address may be incomplete.</p><a class="button primary" href="/guides/">Return to all guides</a></main>`,
  robots: "noindex,follow"
});
fs.writeFileSync(path.join(dist, "404.html"), notFound, "utf8");

fs.mkdirSync(path.join(dist, "assets"), { recursive: true });
fs.copyFileSync(path.join(root, "src", "styles.css"), path.join(dist, "assets", "styles.css"));
for (const asset of fs.readdirSync(path.join(root, "public"))) {
  fs.copyFileSync(path.join(root, "public", asset), path.join(dist, asset));
}

const publicRoutes = ["/", "/guides/", "/dungeons/", "/bosses/", ...pages.map((page) => page.url)];
fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`, "utf8");
fs.writeFileSync(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicRoutes.map((route) => `<url><loc>${escapeHtml(absoluteUrl(route))}</loc><lastmod>${manifest.date}</lastmod></url>`).join("")}</urlset>\n`, "utf8");

console.log(`Built ${pages.length} guide pages plus home, indexes and 404 in ${dist}`);
