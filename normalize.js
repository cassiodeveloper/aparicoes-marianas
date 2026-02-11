import fs from "fs";

const INPUT = "./data/apparitions.json";
const OUTPUT = "./data/apparitions.normalized.json";

function toNumber(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    return Number(v.trim().replace(",", "."));
  }
  return NaN;
}

const raw = fs.readFileSync(INPUT, "utf-8");
const data = JSON.parse(raw);

let missing = [];

const normalized = data.map(a => {

  // Já tem coordinates
  if (a.coordinates) {
    const lat = toNumber(a.coordinates.lat);
    const lng = toNumber(a.coordinates.lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return {
        ...a,
        coordinates: { lat, lng }
      };
    }
  }

  // Caso antigo com lat/lng soltos
  if ("lat" in a && "lng" in a) {
    const lat = toNumber(a.lat);
    const lng = toNumber(a.lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const { lat: _, lng: __, ...rest } = a;
      return {
        ...rest,
        coordinates: { lat, lng }
      };
    }
  }

  missing.push(a.id);
  return a;
});

fs.writeFileSync(
  OUTPUT,
  JSON.stringify(normalized, null, 2),
  "utf-8"
);

console.log("✔ Normalização concluída.");
console.log("⚠ Registros sem coordenadas válidas:");
console.log(missing);
