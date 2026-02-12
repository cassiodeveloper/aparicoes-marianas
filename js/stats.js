// stats.js needs labels; keep it self-contained
window.statsLabels = window.statsLabels || {
  pt: {
    total: "Total",
    holy_see: "Santa Sé",
    diocesan_approved: "Aprovação diocesana",
    under_investigation: "Sob investigação",
    not_recognized: "Não reconhecida",
    medieval_tradition: "Tradição histórica",
    modern: "Aparições modernas",
    centuries: "Por século",
    continents: "Por continente"
  },
  en: {
    total: "Total",
    holy_see: "Holy See",
    diocesan_approved: "Diocesan approval",
    under_investigation: "Under investigation",
    not_recognized: "Not recognized",
    medieval_tradition: "Historical tradition",
    modern: "Modern apparitions",
    centuries: "By century",
    continents: "By continent"
  }
};

let STATS = null;

function getLang() {
  return window.lang || document.documentElement.lang || "pt";
}

function renderStats() {
  if (!STATS) return;

  const el = document.getElementById("stats");
  if (!el) return;

  const lang = getLang();
  const t = window.statsLabels[lang] || window.statsLabels.pt;

  el.innerHTML = `
    <strong>${t.total}:</strong> ${STATS.total} ·
    <strong>${t.holy_see}:</strong> ${STATS.byAuthority.holy_see || 0} ·
    <strong>${t.diocesan_approved}:</strong> ${STATS.byAuthority.diocesan_approved || 0} ·
    <strong>${t.under_investigation}:</strong> ${STATS.byAuthority.under_investigation || 0} ·
    <strong>${t.not_recognized}:</strong> ${STATS.byAuthority.not_recognized || 0}
    <span style="margin-left:12px;color:#777">
      (${t.updated} ${new Date(STATS.generatedAt).toLocaleString(window.lang)})
    </span>
  `;
}

fetch("data/stats.json")
  .then(r => r.json())
  .then(s => {
    STATS = s;
    renderStats();
  });

window.renderStats = renderStats;