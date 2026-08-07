// scripts/sitemap.js
// Generates sitemap.xml from data/apparitions.json:
// homepage + about + one entry per apparition detail page.
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data", "apparitions.json");
const OUT = path.join(ROOT, "sitemap.xml");

const BASE = "https://marian-apparitions.org";

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>"
  ].join("\n");
}

function main() {
  const json = JSON.parse(fs.readFileSync(DATA, "utf-8"));
  const data = Array.isArray(json) ? json : json.data || [];
  const lastmod = (json._meta && json._meta.lastUpdated) || new Date().toISOString().slice(0, 10);

  const entries = [
    urlEntry(`${BASE}/`, lastmod, "monthly", "1.0"),
    urlEntry(`${BASE}/about.html`, lastmod, "yearly", "0.5")
  ];

  for (const a of data) {
    if (!a.id) continue;
    entries.push(
      urlEntry(`${BASE}/apparition.html?id=${encodeURIComponent(a.id)}`, lastmod, "monthly", "0.8")
    );
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join("\n") +
    `\n</urlset>\n`;

  fs.writeFileSync(OUT, xml, "utf-8");
  console.log(`🗺️  sitemap.xml gerado com ${data.length} aparições (${entries.length} URLs no total)`);
}

main();
