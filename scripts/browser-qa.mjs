import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const qaRoot = path.join(projectRoot, "docs", "browser-qa");
const playwrightModule = "C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
const { chromium } = await import(pathToFileURL(playwrightModule).href);
const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, "content", "manifest.json"), "utf8"));
const baseUrl = "http://127.0.0.1:4173";
const routes = ["/", "/guides/", "/dungeons/", "/bosses/", ...manifest.pages.map((page) => page.url)];

fs.mkdirSync(qaRoot, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];
const routeResults = [];

for (const route of routes) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  const status = response?.status() || 0;
  const title = await page.title();
  const h1 = await page.locator("h1").first().textContent();
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  const parsedSchemas = jsonLd.map((value) => JSON.parse(value));
  const articleSchema = route === "/" || ["/guides/", "/dungeons/", "/bosses/"].includes(route)
    ? true
    : parsedSchemas.some((schema) => schema["@type"] === "Article");
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  const result = { route, status, title, h1, canonical, schemas: parsedSchemas.map((schema) => schema["@type"]), hasOverflow, consoleErrors };
  routeResults.push(result);
  if (status !== 200 || !title || !h1 || !canonical || !articleSchema || hasOverflow || consoleErrors.length) {
    errors.push(result);
  }
  await page.close();
}

const captures = [
  { name: "home-desktop", route: "/", width: 1440, height: 1100 },
  { name: "home-mobile", route: "/", width: 390, height: 844 },
  { name: "article-desktop", route: "/bosses/cronos/", width: 1440, height: 1100 },
  { name: "article-mobile", route: "/bosses/cronos/", width: 390, height: 844 },
  { name: "not-found", route: "/404-does-not-exist/", width: 1100, height: 800 }
];
const captureResults = [];

for (const capture of captures) {
  const page = await browser.newPage({ viewport: { width: capture.width, height: capture.height } });
  const response = await page.goto(`${baseUrl}${capture.route}`, { waitUntil: "networkidle" });
  const expectedStatus = capture.name === "not-found" ? 404 : 200;
  captureResults.push({ name: capture.name, route: capture.route, status: response?.status() || 0, viewport: `${capture.width}x${capture.height}` });
  if (response?.status() !== expectedStatus) errors.push({ capture: capture.name, expectedStatus, actualStatus: response?.status() });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (overflow) errors.push({ capture: capture.name, horizontalOverflow: true });
  await page.screenshot({ path: path.join(qaRoot, `${capture.name}.png`), fullPage: false });
  await page.close();
}

const assetPage = await browser.newPage();
const assetResults = [];
for (const asset of ["/favicon.ico", "/favicon-32.png", "/apple-touch-icon.png", "/icon-512.png"]) {
  const response = await assetPage.goto(`${baseUrl}${asset}`);
  assetResults.push({ route: asset, status: response?.status() || 0, contentType: response?.headers()["content-type"] || "" });
  if (response?.status() !== 200) errors.push({ asset, status: response?.status() });
}
await assetPage.close();

await browser.close();

const summary = {
  checkedAt: new Date().toISOString(),
  browser: `Playwright Chromium ${browser.version()}`,
  publicRoutes: routes.length,
  guideRoutes: manifest.pages.length,
  routeStatus200: routeResults.filter((item) => item.status === 200).length,
  consoleErrorCount: routeResults.reduce((sum, item) => sum + item.consoleErrors.length, 0),
  overflowCount: routeResults.filter((item) => item.hasOverflow).length,
  expected404: captureResults.some((item) => item.name === "not-found" && item.status === 404),
  iconResponses: 4,
  screenshots: captures.map((capture) => `${capture.name}.png`),
  errors
};
fs.writeFileSync(path.join(qaRoot, "route-results.json"), `${JSON.stringify(routeResults, null, 2)}\n`);
fs.writeFileSync(path.join(qaRoot, "http-results.json"), `${JSON.stringify({ routes: routeResults.map(({ route, status }) => ({ route, status })), captures: captureResults, assets: assetResults }, null, 2)}\n`);
fs.writeFileSync(path.join(qaRoot, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);

if (errors.length) {
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(summary, null, 2));
