// scripts/stats.js
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data", "apparitions.json");
const OUT = path.join(ROOT, "data", "stats.json");

function main() {
  const items = JSON.parse(fs.readFileSync(DATA, "utf-8"));

  const byAuthority = {};
  const byContinent = {};
  const byCentury = {};
  const byCountry = {};

  for (const a of items) {
    byAuthority[a.authorityLevel] =
      (byAuthority[a.authorityLevel] || 0) + 1;

    byContinent[a.continent] =
      (byContinent[a.continent] || 0) + 1;

    byCentury[a.century] =
      (byCentury[a.century] || 0) + 1;

    const country = (a.tags || []).find(t =>
      [
        "brazil","portugal","france","belgium","ireland","italy","spain",
        "mexico","usa","canada","argentina","chile","colombia","venezuela",
        "ecuador","rwanda","egypt","japan","philippines","india","china","bosnia"
      ].includes(t)
    );

    if (country) {
      byCountry[country] = (byCountry[country] || 0) + 1;
    }
  }

  const stats = {
    total: items.length,
    byAuthority,
    byContinent,
    byCentury,
    byCountry,
    generatedAt: new Date().toISOString()
  };

  fs.writeFileSync(OUT, JSON.stringify(stats, null, 2) + "\n", "utf-8");
  console.log("📊 stats.json gerado com sucesso");
}

main();
