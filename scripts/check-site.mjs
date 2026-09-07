import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "content", "manifest.json"), "utf8"));
const expectedRoutes = ["/", "/guides/", "/dungeons/", "/bosses/", ...manifest.pages.map((page) => page.url)];

function fileForRoute(route) {
  return route === "/" ? path.join(dist, "index.html") : path.join(dist, route.replace(/^\//, ""), "index.html");
}

const errors = [];
for (const route of expectedRoutes) {
  const file = fileForRoute(route);
  if (!fs.existsSync(file)) {
    errors.push(`Missing route: ${route}`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  const requiredMarkup = ['<meta name="description"', '<meta name="keywords"', '<link rel="canonical"', 'href="/favicon.ico"', 'googletagmanager.com/gtag/js?id=G-LVPEX9E4KB', "gtag('config', 'G-LVPEX9E4KB')"];
  if (route !== "/") requiredMarkup.push('application/ld+json');
  for (const required of requiredMarkup) {
    if (!html.includes(required)) errors.push(`${route} missing ${required}`);
  }
  const hrefs = [...html.matchAll(/href="(\/[^"#?]*)/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (/\.[a-z0-9]+$/i.test(href)) {
      if (!fs.existsSync(path.join(dist, href.slice(1)))) errors.push(`${route} has broken asset ${href}`);
    } else if (!fs.existsSync(fileForRoute(href))) {
      errors.push(`${route} has broken internal link ${href}`);
    }
  }
}

for (const file of ["404.html", "robots.txt", "sitemap.xml", "site.webmanifest"]) {
  if (!fs.existsSync(path.join(dist, file))) errors.push(`Missing ${file}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${expectedRoutes.length} public routes, metadata, assets and internal links.`);
