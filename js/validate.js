// scripts/validate.js
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data", "apparitions.json");

const AUTH_LEVELS = {
  holy_see: 1,
  diocesan_approved: 2,
  historical_tradition: 3,
  under_investigation: 4,
  not_recognized: 5
};

const SOURCE_TYPES = new Set(["holy_see", "diocesan", "vatican", "sanctuary", "historical", "other"]);

function fail(msg) {
  console.error("❌ VALIDATION FAILED:", msg);
  process.exit(1);
}

function main() {
  if (!fs.existsSync(DATA)) fail("data/apparitions.json não encontrado");

  const items = JSON.parse(fs.readFileSync(DATA, "utf-8"));
  if (!Array.isArray(items)) fail("JSON raiz não é array");

  const ids = new Set();

  for (const a of items) {
    // ID
    if (!a.id) fail("Item sem id");
    if (ids.has(a.id)) fail(`ID duplicado: ${a.id}`);
    ids.add(a.id);

    // Campos básicos
    if (!a.name?.pt || !a.name?.en) fail(`name.pt/en faltando: ${a.id}`);
    if (!a.location) fail(`location faltando: ${a.id}`);
    if (!Number.isInteger(a.year)) fail(`year inválido: ${a.id}`);
    if (!Number.isInteger(a.century)) fail(`century inválido: ${a.id}`);

    // Authority
    if (!AUTH_LEVELS[a.authorityLevel]) {
      fail(`authorityLevel inválido em ${a.id}`);
    }

    if (a.authorityLevel === "holy_see" && a.canonicalRank !== 1)
      fail(`canonicalRank inconsistente em ${a.id}. Esperado ${AUTH_LEVELS[a.authorityLevel]}, veio ${a.canonicalRank}`);

    if (a.authorityLevel === "diocesan_approved" && a.canonicalRank !== 2 && a.canonicalRank !== 3)
      fail(`canonicalRank inconsistente em ${a.id}. Esperado ${AUTH_LEVELS[a.authorityLevel]}, veio ${a.canonicalRank}`);

    if (a.authorityLevel === "under_investigation" && a.canonicalRank !== 4)
      fail(`canonicalRank inconsistente em ${a.id}. Esperado ${AUTH_LEVELS[a.authorityLevel]}, veio ${a.canonicalRank}`);

    if (a.authorityLevel === "not_recognized" && a.canonicalRank !== 5)
      fail(`canonicalRank inconsistente em ${a.id}. Esperado ${AUTH_LEVELS[a.authorityLevel]}, veio ${a.canonicalRank}`);

    const lat = toNumber(a.coordinates?.lat ?? a.lat);
    const lng = toNumber(a.coordinates?.lng ?? a.lng);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      fail(`lat inválido em ${a.id}`);
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      fail(`lng inválido em ${a.id}`);
    }

    // Tags
    if (!Array.isArray(a.tags) || a.tags.length === 0) {
      fail(`tags ausentes em ${a.id}`);
    }

    // lastReviewedByChurch
    if (
      a.lastReviewedByChurch !== null &&
      a.lastReviewedByChurch !== undefined &&
      !Number.isInteger(a.lastReviewedByChurch)
    ) {
      fail(`lastReviewedByChurch inválido em ${a.id}`);
    }

    // Sources
    if (a.sources && !Array.isArray(a.sources)) {
      fail(`sources não é array em ${a.id}`);
    }

    for (const s of a.sources || []) {
      if (!SOURCE_TYPES.has(s.type)) {
        fail(`source.type inválido em ${a.id}`);
      }
      if (!s.title || !s.url) {
        fail(`source incompleta em ${a.id}`);
      }
      if (!s.url.startsWith("https://")) {
        fail(`source.url deve ser https em ${a.id}`);
      }
      if (s.type === "vatican") {
        try {
          const url = new URL(s.url);
          const host = url.hostname.toLowerCase();

          const allowedVaticanDomains = [
            "vatican.va",
            "vaticannews.va",
            "press.vatican.va",
            "osservatoreromano.va"
          ];

          const isValid = allowedVaticanDomains.some(d =>
            host === d || host.endsWith("." + d)
          );

          if (!isValid) {
            fail(`fonte vatican fora dos domínios oficiais em ${a.id}`);
          }

        } catch {
          fail(`URL inválida em fonte vatican em ${a.id}`);
        }
      }
    }
  }

  console.log(`✅ VALIDATION OK — ${items.length} aparições válidas`);
}


function toNumber(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v.trim().replace(",", "."));
  return NaN;
}

main();