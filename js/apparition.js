const params = new URLSearchParams(window.location.search);
const apparitionId = params.get("id");
window.lang = localStorage.getItem("lang") || "pt";

if (!apparitionId) {
  document.body.innerHTML = "<p style='padding:40px'>Aparição não encontrada.</p>";
  throw new Error("ID não informado");
}

fetch("data/apparitions.json")
  .then(r => r.json())
  .then(data => {
    const a = data.find(x => x.id === apparitionId);
    if (!a) throw new Error("Aparição não encontrada");

    render(a);
  })
  .catch(err => {
    console.error("Erro ao carregar dados:", err);
    document.body.innerHTML = `
      <div style="padding:40px;font-family:sans-serif">
        <h2>Erro ao carregar dados</h2>
        <pre>${err.message}</pre>
      </div>
    `;
  });

function render(a) {
  document.title += " – " + (a.title || a.name.pt || a.name.en);

  document.getElementById("title").textContent = a.title || a.name.pt || a.name.en;
  document.getElementById("subtitle").textContent = `${a.location}, ${a.continent}`;

  document.getElementById("year").textContent = a.year;

  const statusEl = document.getElementById("status");
  statusEl.textContent = statusLabel(a.authorityLevel);
  statusEl.classList.add(
    a.authorityLevel === "holy_see" ? "holy" : "other"
  );

  document.getElementById("authority").textContent = authorityLabel(a.authorityLevel);
  document.getElementById("summary").textContent = getSummary(a);

  renderSources(a.sources || []);
  renderBreadcrumb(a);
}

function getSummary(a) {
  const s =
    a.summary ||
    a.historicalSummary ||
    a.description ||
    a.history ||
    a.notes ||
    (a.sources && a.sources[0] ? a.sources[0].title : null);

  if (!s) return "Resumo histórico não disponível.";

  // Caso seja objeto multilíngue
  if (typeof s === "object") {
    return (
      s?.[lang] ||
      s?.pt ||
      s?.en ||
      "Resumo histórico não disponível."
    );
  }

  // Caso seja string simples
  return typeof s === "string" ? s : String(s);
}

function renderSources(sources) {
  const ul = document.getElementById("sources");
  ul.innerHTML = "";

  if (sources.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nenhuma fonte disponível.";
      ul.appendChild(li);
  } else {
      sources.forEach(s => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = s.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = s.title || s.url;
        li.appendChild(a);
        ul.appendChild(li);
      });
  }
}

function renderBreadcrumb(a) {
  const bc = document.getElementById("breadcrumb");

  const country =
    a.countryName ||
    a.country ||
    a.location ||
    a.location?.country ||
    "—";

  const title = a.title || a.name.pt || a.name.en || "Aparição";

  bc.innerHTML = `
    <a href="index.html">Voltar ao mapa</a>
    <span>→</span>
    <span>${country}</span>
    <span>→</span>
    <strong>${title}</strong>
  `;
}

function statusLabel(level) {
  return {
    holy_see: "Aprovada pela Santa Sé",
    diocesan_approved: "Aprovada localmente",
    under_investigation: "Em investigação",
    not_recognized: "Não reconhecida"
  }[level] || level;
}

function authorityLabel(level) {
  return {
    holy_see: "Santa Sé",
    diocesan_approved: "Autoridade diocesana",
    under_investigation: "Em análise eclesiástica",
    not_recognized: "Sem reconhecimento oficial"
  }[level] || level;
}