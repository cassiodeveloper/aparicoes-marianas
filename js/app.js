let map;
let markers = [];
let data = [];
let lang = "pt";
window.lang = lang;
let restrictHolySeeOnly = false;
let selectedId = null;

async function loadData() {
fetch("data/apparitions.json")
  .then(r => {
    if (!r.ok) throw new Error("JSON não carregou");
    return r.json();
  })
  .then(json => {
    data = json;
    populateCenturyFilter();
    refreshUI(true);
    renderLegend();
  })
  .catch(err => {
    console.error("Erro ao inicializar app:", err);
  });
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 3,
    styles: [
      // Base geral – dessaturação leve
      {
        stylers: [
          { saturation: -5 },
          { lightness: 3 }
        ]
      },
      // Terreno / terra
      {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [
          { color: "#e6e3dd" }
        ]
      },
      // Água
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [
          { color: "#dfe6ea" }
        ]
      },
      // Labels de texto
      {
        elementType: "labels.text.fill",
        stylers: [
          { color: "#555555" }
        ]
      },
      {
        elementType: "labels.text.stroke",
        stylers: [
          { color: "#f7f6f3" }
        ]
      },
      // Estradas fora
      {
        featureType: "road",
        stylers: [{ visibility: "off" }]
      },
      // POIs fora
      {
        featureType: "poi",
        stylers: [{ visibility: "off" }]
      },
      // Admin boundaries discretas (opcional, mas ajuda orientação)
      {
        featureType: "administrative",
        elementType: "geometry.stroke",
        stylers: [
          { color: "#cfcfcf" },
          { weight: 0.5 }
        ]
      }
    ]
  });

  hookEvents();
  loadData();
}

function hookEvents() {
  document.getElementById("centuryFilter").addEventListener("change", () => refreshUI(true));
  document.getElementById("continentFilter").addEventListener("change", () => refreshUI(true));

  document.getElementById("langToggle").addEventListener("click", () => {
    lang = lang === "pt" ? "en" : "pt";
    window.lang = lang; // 👈 ESSENCIAL

    document.getElementById("langToggle").textContent =
      lang === "pt" ? "EN" : "PT";

    applyI18n();
    refreshUI(false);
    renderLegend();

    if (window.renderStats) window.renderStats();
    if (window.renderLegend) window.renderLegend();
  });

  document.getElementById("restrictToggle").addEventListener("click", () => {
    restrictHolySeeOnly = !restrictHolySeeOnly;
    const btn = document.getElementById("restrictToggle");
    btn.textContent = restrictHolySeeOnly
      ? (lang === "pt" ? "Santa Sé only: ON" : "Holy See only: ON")
      : (lang === "pt" ? "Santa Sé only: OFF" : "Holy See only: OFF");
    btn.classList.toggle("toggle-on", restrictHolySeeOnly);
    refreshUI(true);
  });
}

function applyI18n() {
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  // document.getElementById("aboutLink").textContent = lang === "pt" ? "Sobre" : "About";
  document.getElementById("title").textContent =
    lang === "pt" ? "Aparições Marianas – Atlas Histórico" : "Marian Apparitions – Historical Atlas";
  document.getElementById("subtitle").textContent =
    lang === "pt"
      ? "Mapa global das aparições marianas: reconhecidas, em investigação e não reconhecidas, com fontes primárias e linha do tempo."
      : "Global map of Marian apparitions: recognized, under investigation and not recognized, with primary sources and timeline.";
  document.getElementById("timelineLabel").textContent =
    lang === "pt"
      ? "Linha do tempo (clique para centralizar no mapa)"
      : "Timeline (click to center on map)";
  document.getElementById("footer").textContent =
    lang === "pt"
      ? "Este projeto classifica cada caso segundo o nível de autoridade eclesial (Santa Sé, aprovação diocesana, investigação ou não reconhecimento), com base em documentação pública disponível."
      : "This project classifies each case according to its level of ecclesial authority (Holy See recognition, diocesan approval, under investigation, or not recognized), based on publicly available documentation.";

  // Labels de continente
  const continent = document.getElementById("continentFilter");
  const labels = {
    pt: { "": "Continente", Europe: "Europa", America: "América", Asia: "Ásia", Africa: "África", Oceania: "Oceania" },
    en: { "": "Continent", Europe: "Europe", America: "Americas", Asia: "Asia", Africa: "Africa", Oceania: "Oceania" }
  };
  [...continent.options].forEach(o => { o.textContent = labels[lang][o.value] ?? o.textContent; });

  // Placeholder do século
  const century = document.getElementById("centuryFilter");
  century.options[0].textContent = lang === "pt" ? "Século" : "Century";
}

function populateCenturyFilter() {
  const centuries = [...new Set(data.map(a => a.century))].sort((a,b)=>a-b);
  const select = document.getElementById("centuryFilter");

  // limpa tudo exceto placeholder
  select.length = 1;

  centuries.forEach(c => {
    const opt = document.createElement("option");
    opt.value = String(c);
    opt.textContent = lang === "pt" ? `${c}º` : `${c}th`;
    select.appendChild(opt);
  });
}

function getFilteredData() {
  const century = document.getElementById("centuryFilter").value;
  const continent = document.getElementById("continentFilter").value;

  return data
    .filter(a => (!century || String(a.century) === century))
    .filter(a => (!continent || a.continent === continent))
    .filter(a => (!restrictHolySeeOnly || a.authorityLevel === "holy_see"))
    .sort((a,b)=>a.year - b.year);
}

function refreshUI(clearSelectionIfMissing = false) {
  const filtered = getFilteredData();
  renderMarkers(filtered);
  renderTimeline(filtered);

  const note = document.getElementById("modeNote");
  note.textContent = restrictHolySeeOnly
    ? (lang === "pt" ? "Modo restrito ativo: apenas Santa Sé." : "Restricted mode: Holy See only.")
    : "";

  if (clearSelectionIfMissing && selectedId) {
    const exists = filtered.some(a => a.id === selectedId);
    if (!exists) {
      selectedId = null;
      hideInfo();
    }
  }

  // se já tem seleção, re-seleciona para atualizar i18n e estado
  if (selectedId) {
    const item = filtered.find(a => a.id === selectedId) || data.find(a => a.id === selectedId);
    if (item) showInfo(item);
    highlightTimeline(selectedId);
  }
}

function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

function markerIcon(status) {
  if (status === "holy_see") {
    return {
      path: "M12 2a10 10 0 1 1 0 20a10 10 0 0 1 0-20zm0 4v12m-6-6h12",
      fillColor: "#b08a2e",
      fillOpacity: 1,
      strokeColor: "#7a5d1d",
      strokeWeight: 1,
      scale: 1,
      anchor: new google.maps.Point(12,12)
    };
  }

  if (status === "local_bishop") {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 6,
      fillColor: "#1b4b91",
      fillOpacity: 1,
      strokeWeight: 0
    };
  }

  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 5,
    fillColor: "#888",
    fillOpacity: 0.8,
    strokeWeight: 0
  };
}

function renderMarkers(items) {
  clearMarkers();

  items.forEach(a => {

    if (!a.coordinates || 
        typeof a.coordinates.lat !== "number" || 
        typeof a.coordinates.lng !== "number") {

      console.warn("Coordenadas inválidas:", a.id);
      return;
    }

    const marker = new google.maps.Marker({
      map,
      position: {
        lat: a.coordinates.lat,
        lng: a.coordinates.lng
      },
      title: a.name?.[lang] || "",
      icon: markerIconByAuthority(a.authorityLevel)
    });

    marker.addListener("click", () => selectApparition(a, true));
    markers.push(marker);
  });
}


function renderTimeline(items) {
  const el = document.getElementById("timeline");
  el.innerHTML = "";

  items.forEach(a => {
    const div = document.createElement("div");
    div.className = "tItem";
    div.dataset.id = a.id;

    const statusText = statusLabel(a.authorityLevel);
    div.innerHTML = `
      <div class="year">${a.year}</div>
      <div class="name">${a.name[lang]}</div>
      <div class="tiny">${statusLabel(a.authorityLevel)}</div>
      <div class="tiny">
        <a href="apparition.html?id=${a.id}" class="timeline-link">
          detalhes →
        </a>
      </div>
    `;

    div.addEventListener("click", () => selectApparition(a, true));
    el.appendChild(div);
  });

  highlightTimeline(selectedId);
}

function highlightTimeline(id) {
  document.querySelectorAll(".tItem").forEach(x => x.classList.remove("active"));
  if (!id) return;
  const active = document.querySelector(`.tItem[data-id="${id}"]`);
  if (active) active.classList.add("active");
}

function selectApparition(a, panTo = false) {
  selectedId = a.id;
  showInfo(a);
  highlightTimeline(a.id);

  if (panTo) {
    map.panTo({
      lat: a.coordinates.lat,
      lng: a.coordinates.lng
    });

    const desiredZoom = 5;
    if (map.getZoom() < desiredZoom) {
      smoothZoom(map, desiredZoom);
    }
  }

  const info = document.getElementById("info");
  info.classList.add("open");

  document.getElementById("info").classList.remove("hidden");
}

function hideInfo() {
  const info = document.getElementById("info");
  info.style.display = "none";
  info.innerHTML = "";
}

function showInfo(a) {
  const info = document.getElementById("info");
  info.style.display = "block";

  const statusText = statusLabel(a.authorityLevel);

  let sourcesHtml = "";
  if (Array.isArray(a.sources) && a.sources.length > 0) {
    const list = a.sources.map(s => {
      const isVatican = s.type === "vatican";
      const label =
        isVatican
          ? (lang === "pt" ? "Santa Sé" : "Holy See")
          : (lang === "pt" ? "Documento diocesano" : "Diocesan document");

      const icon = isVatican ? iconVatican() : iconDiocese();

      return `
        <li class="source-item">
          ${icon}
          <span>
            <strong>[${label}]</strong>
            <a href="${escapeHtml(s.url)}"
              target="_blank"
              rel="noopener noreferrer">
              ${escapeHtml(s.title)}
            </a>
          </span>
        </li>
      `;
    }).join("");

    sourcesHtml = `
      <div class="sources">
        <strong>${lang === "pt" ? "Fontes canônicas primárias" : "Primary canonical sources"}</strong>
        <ul>
          ${list}
        </ul>
      </div>
    `;
  }

  const visionariesText = (() => {
    if (!a.visionaries) return "—";

    // Caso seja objeto { pt, en }
    if (typeof a.visionaries === "object" && !Array.isArray(a.visionaries)) {
      return escapeHtml(
        a.visionaries?.[lang] ||
        a.visionaries?.pt ||
        a.visionaries?.en ||
        "—"
      );
    }

    // Caso seja array de visionários
    if (Array.isArray(a.visionaries)) {
      const names = a.visionaries
        .map(v => v?.name?.[lang] || v?.name?.pt || v?.name?.en)
        .filter(Boolean);

      return names.length ? escapeHtml(names.join(", ")) : "—";
    }

    return "—";
  })();

  const statusClass =
    a.traditionType === "medieval_tradition"
      ? "medieval_tradition"
      : a.authorityLevel;

  info.innerHTML = `

    <div class="info-header">
      <button id="closeInfo">✕</button>
    </div>

    <h2>${escapeHtml(a.name[lang])}</h2>

    <span class="status-pill status-${statusClass}">
      ${escapeHtml(statusText)}
    </span>

    <div class="meta">
      <div><strong>${lang === "pt" ? "Local" : "Location"}:</strong>
        ${escapeHtml(a.location)}
      </div>

      <div><strong>${lang === "pt" ? "Ano" : "Year"}:</strong>
        ${a.year}
      </div>

      <div><strong>${lang === "pt" ? "Século" : "Century"}:</strong>
        ${a.century}
      </div>

      <div><strong>${lang === "pt" ? "Videntes" : "Visionaries"}:</strong>
        ${visionariesText}
      </div>

      <div><strong>${lang === "pt" ? "Continente" : "Continent"}:</strong>
        ${escapeHtml(a.continent)}
      </div>

      <div style="margin-top:16px">
        <a href="apparition.html?id=${a.id}"
          class="detail-link">
          Ver detalhes da aparição →
        </a>
      </div>      
    </div>

    ${sourcesHtml}
  `;

  document.getElementById("closeInfo")
    ?.addEventListener("click", () => {
      const info = document.getElementById("info");
      info.classList.remove("open");
      info.innerHTML = "";
    });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.statsLabels = {
  pt: {
    total: "Total",
    holy_see: "Santa Sé",
    diocesan_approved: "Aprov. diocese",
    under_investigation: "Em investigação",
    not_recognized: "Não reconhecidas",
    updated: "Atualizado em"
  },
  en: {
    total: "Total",
    holy_see: "Holy See",
    diocesan_approved: "Diocesan approved",
    under_investigation: "Under investigation",
    not_recognized: "Not recognized",
    updated: "Updated at"
  }
};

const legendLabels = {
  pt: {
    holy_see: "Aprovada pela Santa Sé",
    diocesan_approved: "Aprovada localmente",
    under_investigation: "Em investigação",
    not_recognized: "Não reconhecida"
  },
  en: {
    holy_see: "Approved by the Holy See",
    diocesan_approved: "Locally approved",
    under_investigation: "Under investigation",
    not_recognized: "Not recognized"
  }
};

window.statsLabels = statsLabels;
window.legendLabels = legendLabels;

function statusLabel(authorityLevel) {
  const pt = {
    holy_see: "Aprovada pela Santa Sé",
    diocesan_approved: "Aprovada localmente",
    under_investigation: "Em investigação",
    not_recognized: "Não reconhecida"
  };
  const en = {
    holy_see: "Approved by the Holy See",
    diocesan_approved: "Locally approved",
    under_investigation: "Under investigation",
    not_recognized: "Not recognized"
  };
  return (lang === "pt" ? pt : en)[authorityLevel] || authorityLevel;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function iconVatican() {
  return `
    <svg class="icon vatican" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5L14 3.5zM8 12h8v1.5H8V12zm0 4h8v1.5H8V16z"/>
    </svg>
  `;
}

function iconDiocese() {
  return `
    <svg class="icon diocese" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l3 3v3h3v14H6V8h3V5l3-3zm-1 9v9h2v-9h-2z"/>
    </svg>
  `;
}

function markerIconByAuthority(authorityLevel) {
  const colors = {
    holy_see: "#b08a2e",
    diocesan_approved: "#1b4b91",
    under_investigation: "#c47f17",
    not_recognized: "#8a8a8a"
  };

  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 6,
    fillColor: colors[authorityLevel] || "#8a8a8a",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 1
  };
}

function smoothZoom(map, targetZoom, callback) {
  const currentZoom = map.getZoom();
  if (currentZoom === targetZoom) {
    if (callback) callback();
    return;
  }

  const step = targetZoom > currentZoom ? 1 : -1;

  const zoomInterval = setInterval(() => {
    const z = map.getZoom();
    if (z === targetZoom) {
      clearInterval(zoomInterval);
      if (callback) callback();
    } else {
      map.setZoom(z + step);
    }
  }, 80);
}

function renderLegend() {
  const el = document.getElementById("legend");
  if (!el) return;

  const t = legendLabels[lang];

  el.innerHTML = `
    <div class="legend">
      <span><i class="dot holy"></i> ${t.holy_see}</span>
      <span><i class="dot diocesan"></i> ${t.diocesan_approved}</span>
      <span><i class="dot investigation"></i> ${t.under_investigation}</span>
      <span><i class="dot rejected"></i> ${t.not_recognized}</span>
    </div>
  `;
}

window.renderLegend = renderLegend;