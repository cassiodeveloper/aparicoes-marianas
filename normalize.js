import fs from "fs";

// ===== CONFIG =====

const INPUT = "data/apparitions.json";
const OUTPUT = "apparitions.normalized.json";

const AUTH_LEVELS = {
  holy_see: 1,
  diocesan_approved: 2,
  approved_devotion: 3,
  under_investigation: 4,
  not_recognized: 5,
  medieval_tradition: 6
};

const ALLOWED_SOURCE_TYPES = ["vatican", "diocesan", "other"];

// ===== LOAD =====

const raw = fs.readFileSync(INPUT, "utf8");
let data = JSON.parse(raw);

// ===== NORMALIZATION =====

// 1️⃣ Remover duplicados por ID
const seen = new Set();
data = data.filter(a => {
  if (seen.has(a.id)) {
    console.log("Removendo duplicado:", a.id);
    return false;
  }
  seen.add(a.id);
  return true;
});

// 2️⃣ Corrigir canonicalRank
data.forEach(a => {
  if (AUTH_LEVELS[a.authorityLevel]) {
    a.canonicalRank = AUTH_LEVELS[a.authorityLevel];
  } else {
    console.warn("authorityLevel desconhecido:", a.id);
  }
});

// 3️⃣ Normalizar source.type
data.forEach(a => {
  if (Array.isArray(a.sources)) {
    a.sources = a.sources.map(s => {
      if (!ALLOWED_SOURCE_TYPES.includes(s.type)) {
        return { ...s, type: "other" };
      }
      return s;
    });
  }
});

// 4️⃣ Normalizar visionaries para array
data.forEach(a => {
  if (!Array.isArray(a.visionaries)) {

    if (a.visionaries && typeof a.visionaries === "object") {
      a.visionaries = [
        {
          name: a.visionaries
        }
      ];
    } else {
      a.visionaries = [];
    }

  }
});

// 5️⃣ Ordenar por ano
data.sort((a, b) => (a.year || 0) - (b.year || 0));

// ===== SAVE =====

fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2), "utf8");

console.log("Dataset normalizado salvo em:", OUTPUT);