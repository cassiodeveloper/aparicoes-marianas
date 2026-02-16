const params = new URLSearchParams(window.location.search);
const apparitionId = params.get("id");
window.lang = localStorage.getItem("lang") || "pt";

if (!apparitionId) {
  document.body.innerHTML = "<p style='padding:40px'>Aparição não encontrada.</p>";
  throw new Error("ID não informado");
}

fetch("data/apparitions.json")
  .then(r => r.json())
  .then(json => {
    const data = json.data;
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

function loadImage(a){
  const container = document.getElementById("detailImage");
  container.innerHTML = "";

  const img = new Image();
  //img.loading = "lazy";
  img.alt = a.name[lang];
  img.title = a.name?.[lang] || a.name?.pt || a.name?.en || "Maria";

  img.src = a.image?.file ? `images/apparitions/${a.image.file}` : "images/apparitions/maria.png";

  container.appendChild(img);
}

function render(a) {
  document.title += " – " + (a.title || a.name.pt || a.name.en);
  document.getElementById("title").textContent = a.title || a.name.pt || a.name.en;
  document.getElementById("subtitle").textContent = `${a.location}, ${a.continent}`;
  document.getElementById("year").textContent = a.year;

  const statusEl = document.getElementById("status");

  statusEl.innerHTML = `
    <span class="status-pill status-${a.authorityLevel}">
      ${statusLabel(a.authorityLevel)}
    </span>
  `;

  loadImage(a);

  document.getElementById("authority").textContent = authorityLabel(a.authorityLevel);
  document.getElementById("summary").textContent = getSummary(a);

  renderSources(a.sources || []);
  renderBreadcrumb(a);
  injectStructuredData(a);
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
  const labels = {
    pt: {
      holy_see: "Santa Sé",
      diocesan_approved: "Aprovação diocesana",
      approved_devotion: "Culto oficialmente aprovado",
      under_investigation: "Sob investigação",
      not_recognized: "Não reconhecida",
      medieval_tradition: "Tradição histórica"
    },
    en: {
      holy_see: "Holy See",
      diocesan_approved: "Diocesan approval",
      approved_devotion: "Officially approved devotion",
      under_investigation: "Under investigation",
      not_recognized: "Not recognized",
      medieval_tradition: "Historical tradition"
    }
  };

  return labels[lang]?.[level] || level;
}

function authorityLabel(level) {
  return {
    holy_see: "Santa Sé",
    diocesan_approved: "Autoridade diocesana",
    under_investigation: "Em análise eclesiástica",
    not_recognized: "Sem reconhecimento oficial"
  }[level] || level;
}

function injectStructuredData(a) {

  const lang = document.documentElement.lang || "en";

  const structured = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": a.name[lang] || a.name.en || a.name.pt,
    "description": getSummary(a),
    "inLanguage": lang,
    "datePublished": a.year ? `${a.year}-01-01` : undefined,
    "dateModified": new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": "Cássio Batista Pereira"
    },
    "publisher": {
      "@type": "Person",
      "name": "Cássio Batista Pereira"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${location.origin}/apparition.html?id=${a.id}`
    },
    "about": {
      "@type": "Place",
      "name": a.location,
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": a.coordinates?.lat,
        "longitude": a.coordinates?.lng
      }
    }
  };

  if (a.image?.file) {
    structured.image = `${location.origin}/images/apparitions/${a.image.file}`;
  }

  Object.keys(structured).forEach(k => structured[k] === undefined && delete structured[k]);

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(structured);

  document.head.appendChild(script);
}
