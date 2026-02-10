let STATS = null;

function renderStats() {
  if (!STATS) return;

  const el = document.getElementById("stats");
  if (!el) return;

  const t = window.statsLabels?.[window.lang] || statsLabels.pt;

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