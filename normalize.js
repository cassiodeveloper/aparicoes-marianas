import fs from "fs";

const raw = fs.readFileSync("data/apparitions.json", "utf8");
const data = JSON.parse(raw);

function normalizeRank(a) {

  if (a.authorityLevel === "holy_see") {
    return 1;
  }

  if (a.authorityLevel === "diocesan_approved") {

    if (a.traditionType === "medieval_tradition") {
      return 3; // tradição histórica consolidada
    }

    return 2; // aparição moderna reconhecida
  }

  if (a.authorityLevel === "under_investigation") {
    return 4;
  }

  if (a.authorityLevel === "not_recognized") {
    return 5;
  }

  return 4; // fallback seguro
}

const normalized = data.map(a => ({
  ...a,
  canonicalRank: normalizeRank(a)
}));

fs.writeFileSync(
  "./apparitions.normalized.json",
  JSON.stringify(normalized, null, 2)
);

console.log("✅ Dataset normalizado com sucesso.");