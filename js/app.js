let map;
let markers = [];
let data = [];
let lang = document.documentElement.lang || "en";
let restrictHolySeeOnly = false;
let selectedId = null;
let collapsedCenturies = new Set();

window.lang = lang;

// Harmonized ecclesial palette — shared by map markers, legend and status pills
const AUTHORITY_COLORS = {
  holy_see: "#2f6b3d",
  diocesan_approved: "#2f5f8f",
  under_investigation: "#8c6a1c",
  not_recognized: "#9c3a3a",
  medieval_tradition: "#5b3d7a",
  approved_devotion: "#6a3d86"
};

function loadData() {
fetch("data/apparitions.json")
  .then(r => {
    if (!r.ok) throw new Error("JSON não carregou");
    return r.json();
  })
  .then(json => {
    data = json.data;
    populateCenturyFilter();
    populateStatusFilter();
    refreshUI(true);
    renderLegend();
  })
  .catch(err => {
    console.error("Erro ao inicializar app:", err);
  });
}

function initAdvancedFiltersUI() {

  const btn = document.getElementById("advancedToggle");
  const panel = document.getElementById("advancedPanel");

  if (!btn || !panel) return;

  btn.addEventListener("click", () => {
    panel.classList.toggle("is-collapsed");

    const isOpen = !panel.classList.contains("is-collapsed");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 3,
    styles: [
      {
        stylers: [
          { saturation: -5 },
          { lightness: 3 }
        ]
      },
      {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [
          { color: "#e6e3dd" }
        ]
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [
          { color: "#dfe6ea" }
        ]
      },
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
      {
        featureType: "road",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "poi",
        stylers: [{ visibility: "off" }]
      },
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
  document.getElementById("statusFilter").addEventListener("change", () => refreshUI(true));
  document.getElementById("rankFilter").addEventListener("change", refreshUI);
  document.getElementById("eraFilter").addEventListener("change", refreshUI);
  document.getElementById("continuityFilter").addEventListener("change", refreshUI);

  document.getElementById("langToggle").addEventListener("click", () => {
    lang = lang === "pt" ? "en" : "pt";
    window.lang = lang;

    document.getElementById("langToggle").textContent =
      lang === "pt" ? "EN" : "PT";

    populateStatusFilter();

    applyI18n();
    refreshUI(false);
    renderLegend();

    if (window.renderStats) window.renderStats();
    if (window.renderLegend) window.renderLegend();
  });

  initAdvancedFiltersUI();
  initTimelineToggle();
}

function initTimelineToggle() {
  const btn = document.getElementById("timelineToggle");
  const wrap = document.getElementById("timelineWrap");

  if (!btn || !wrap) return;

  btn.addEventListener("click", () => {
    const collapsed = wrap.classList.toggle("is-collapsed");
    btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    updateTimelineToggleLabel();
  });

  updateTimelineToggleLabel();
}

function updateTimelineToggleLabel() {
  const label = document.getElementById("timelineToggleLabel");
  const wrap = document.getElementById("timelineWrap");

  if (!label || !wrap) return;

  const collapsed = wrap.classList.contains("is-collapsed");
  label.textContent = collapsed
    ? (lang === "pt" ? "Mostrar" : "Show")
    : (lang === "pt" ? "Ocultar" : "Hide");
}

function applyI18n() {
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.getElementById("titleMain").textContent = lang === "pt" ? "Aparições Marianas" : "Marian Apparitions";
  document.getElementById("titleSub").textContent = lang === "pt" ? "Atlas Histórico" : "Historical Atlas";
  document.getElementById("timelineLabel").textContent = lang === "pt" ? "Linha do tempo (clique para centralizar no mapa)" : "Timeline (click to center on map)";

  document.getElementById("subtitle").textContent =
    lang === "pt"
      ? "Mapa global das aparições marianas: reconhecidas, em investigação e não reconhecidas, com fontes primárias e linha do tempo."
      : "Global map of Marian apparitions: recognized, under investigation and not recognized, with primary sources and timeline.";
    document.getElementById("footerText").textContent =
  lang === "pt"
    ? "Este projeto classifica cada caso segundo o nível de autoridade eclesial (Santa Sé, aprovação diocesana, investigação ou não reconhecimento), com base em documentação pública disponível."
    : "This project classifies each case according to its level of ecclesial authority (Holy See recognition, diocesan approval, under investigation, or not recognized), based on publicly available documentation.";

  const continent = document.getElementById("continentFilter");
  const labels = {
    pt: { "": "Continente", Europe: "Europa", America: "América", Asia: "Ásia", Africa: "África", Oceania: "Oceania" },
    en: { "": "Continent", Europe: "Europe", America: "Americas", Asia: "Asia", Africa: "Africa", Oceania: "Oceania" }
  };
  [...continent.options].forEach(o => { o.textContent = labels[lang][o.value] ?? o.textContent; });

  const century = document.getElementById("centuryFilter");
  [...century.options].forEach((o, i) => {
    o.textContent = i === 0 ? (lang === "pt" ? "Século" : "Century") : centuryOrdinal(o.value);
  });

  document.getElementById("advancedLabel").textContent = lang === "pt" ? "Filtros avançados" : "Advanced filters";

  document.querySelector('#rankFilter option[value=""]').textContent = lang === "pt" ? "Autoridade" : "Authority";

  [1, 2, 3, 4, 5, 6].forEach(n => {
    const opt = document.querySelector(`#rankFilter option[value="${n}"]`);
    if (opt) opt.textContent = lang === "pt" ? `Nível ${n}` : `Level ${n}`;
  });

  document.querySelector('#eraFilter option[value=""]').textContent = lang === "pt" ? "Período" : "Period";

  document.querySelector('#eraFilter option[value="modern"]').textContent = lang === "pt" ? "Moderna (≥ 1800)" : "Modern (≥ 1800)";

  document.querySelector('#eraFilter option[value="tradition"]').textContent = lang === "pt" ? "Tradição (< 1800)" : "Tradition (< 1800)";

  document.getElementById("continuityLabel").textContent = lang === "pt" ? "Continuidade (múltiplos casos)" : "Continuity (multiple cases)";

  updateTimelineToggleLabel();
}

function populateCenturyFilter() {
  const centuries = [...new Set(data.map(a => a.century))].sort((a,b)=>a-b);
  const select = document.getElementById("centuryFilter");

  select.length = 1;

  centuries.forEach(c => {
    const opt = document.createElement("option");
    opt.value = String(c);
    opt.textContent = centuryOrdinal(c);
    select.appendChild(opt);
  });
}

function getFilteredData() {

  const century = document.getElementById("centuryFilter").value;
  const continent = document.getElementById("continentFilter").value;
  const statusValue = document.getElementById("statusFilter")?.value || "all";
  const rank = document.getElementById("rankFilter")?.value || "";
  const era = document.getElementById("eraFilter")?.value || "";
  const continuity = document.getElementById("continuityFilter")?.checked;

  let filtered = [...data];

  if (century) {
    filtered = filtered.filter(a => String(a.century) === century);
  }

  if (continent) {
    filtered = filtered.filter(a => a.continent === continent);
  }

  if (rank) {
    filtered = filtered.filter(a => String(a.canonicalRank) === rank);
  }

  if (statusValue !== "all") {

    if (statusValue === "medieval_tradition") {
      filtered = filtered.filter(a => a.traditionType === "medieval_tradition");
    } else {
      filtered = filtered.filter(a => a.authorityLevel === statusValue);
    }
  }

  if (era === "modern") {
    filtered = filtered.filter(a => a.year >= 1800);
  }

  if (era === "tradition") {
    filtered = filtered.filter(a => a.year < 1800 || a.traditionType);
  }

  if (continuity) {
    const countByCountry = {};
    filtered.forEach(a => {
      countByCountry[a.continent + "-" + a.location] =
        (countByCountry[a.continent + "-" + a.location] || 0) + 1;
    });

    filtered = filtered.filter(
      a => countByCountry[a.continent + "-" + a.location] > 1
    );
  }

  return filtered.sort((a, b) => a.year - b.year);
}

function updateAdvancedIndicator() {
  const btn = document.getElementById("advancedToggle");
  if (!btn) return;

  const rank = document.getElementById("rankFilter")?.value || "";
  const era = document.getElementById("eraFilter")?.value || "";
  const continuity = document.getElementById("continuityFilter")?.checked;

  const active = Boolean(rank || era || continuity);
  btn.classList.toggle("has-active", active);

  // Highlight individual selects whose value differs from the default
  const defaults = {
    centuryFilter: "",
    continentFilter: "",
    statusFilter: "all",
    rankFilter: "",
    eraFilter: ""
  };
  Object.keys(defaults).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("is-active", el.value !== defaults[id]);
  });
}

function refreshUI(clearSelectionIfMissing = false) {
  const filtered = getFilteredData();

  updateAdvancedIndicator();

  renderMarkers(filtered);
  renderTimeline(filtered);

  const note = document.getElementById("modeNote");
  note.textContent = "";

  if (clearSelectionIfMissing && selectedId) {
    const exists = filtered.some(a => a.id === selectedId);
    if (!exists) {
      selectedId = null;
      hideInfo();
    }
  }
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
      icon: markerIconByAuthority(a.authorityLevel, a.traditionType)
    });

    marker.addListener("click", () => selectApparition(a, true));
    markers.push(marker);
  });
}

function centuryOrdinal(c) {
  const n = Number(c);
  if (lang === "pt") return `${n}º`;

  const mod100 = n % 100;
  const mod10 = n % 10;
  let suffix = "th";
  if (mod100 < 11 || mod100 > 13) {
    if (mod10 === 1) suffix = "st";
    else if (mod10 === 2) suffix = "nd";
    else if (mod10 === 3) suffix = "rd";
  }
  return `${n}${suffix}`;
}

function renderTimeline(items) {
  const el = document.getElementById("timeline");
  el.innerHTML = "";

  // Count per century (within the current filtered set)
  const counts = {};
  items.forEach(a => {
    if (a.century != null) counts[a.century] = (counts[a.century] || 0) + 1;
  });

  let currentItems = null;
  let lastCentury = null;

  items.forEach(a => {
    // Start a new collapsible "folder" whenever the century changes
    if (a.century != null && a.century !== lastCentury) {
      lastCentury = a.century;

      const group = document.createElement("div");
      group.className = "tGroup";
      group.dataset.century = String(a.century);

      const header = document.createElement("div");
      header.className = "tCentury";
      header.tabIndex = 0;
      header.setAttribute("role", "button");
      header.setAttribute("aria-expanded", "true");
      header.innerHTML = `
        <span class="tCentury-num">${centuryOrdinal(a.century)}</span>
        <span class="tCentury-cap">${lang === "pt" ? "século" : "century"}</span>
        <span class="tCentury-count">${counts[a.century]}</span>
        <svg class="tt-chevron" viewBox="0 0 12 8" width="11" height="8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      `;

      const century = a.century;
      const toggle = () => {
        const collapsed = group.classList.toggle("is-collapsed");
        header.setAttribute("aria-expanded", collapsed ? "false" : "true");
        if (collapsed) collapsedCenturies.add(century);
        else collapsedCenturies.delete(century);
      };
      header.addEventListener("click", toggle);
      header.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });

      const groupItems = document.createElement("div");
      groupItems.className = "tGroup-items";

      if (collapsedCenturies.has(century)) {
        group.classList.add("is-collapsed");
        header.setAttribute("aria-expanded", "false");
      }

      group.appendChild(header);
      group.appendChild(groupItems);
      el.appendChild(group);
      currentItems = groupItems;
    }

    const div = document.createElement("div");
    div.className = "tItem";
    div.dataset.id = a.id;
    div.dataset.status = a.traditionType === "medieval_tradition" ? "medieval_tradition" : a.authorityLevel;

    div.innerHTML = `
      <div class="year">${a.year}</div>
      <div class="name">${a.name[lang]}</div>
      <div class="tiny">${statusLabel(a.authorityLevel)}</div>
      <div class="tiny">
        <a href="apparition.html?id=${a.id}" class="timeline-link">
          ${lang === "pt" ? "detalhes" : "details"} →
        </a>
      </div>
    `;

    div.addEventListener("click", () => selectApparition(a, true));
    (currentItems || el).appendChild(div);
  });

  highlightTimeline(selectedId);
}

function highlightTimeline(id) {
  document.querySelectorAll(".tItem").forEach(x => x.classList.remove("active"));
  if (!id) return;
  const active = document.querySelector(`.tItem[data-id="${id}"]`);
  if (!active) return;

  active.classList.add("active");

  // Auto-expand the century folder so the selection is visible
  const group = active.closest(".tGroup");
  if (group && group.classList.contains("is-collapsed")) {
    group.classList.remove("is-collapsed");
    const header = group.querySelector(".tCentury");
    if (header) header.setAttribute("aria-expanded", "true");
    collapsedCenturies.delete(Number(group.dataset.century));
  }
}

function selectApparition(a, panTo = false) {
  if (typeof gtag === "function") {
    gtag('event', 'view_apparition', {
      apparition_id: a.id,
      authority_level: a.authorityLevel
    });
  }
  selectedId = a.id;
  showInfo(a);
  highlightTimeline(a.id);

  if (!a.coordinates) return;

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
  info.classList.remove("open");
  info.innerHTML = "";
}

function showInfo(a) {
  document.getElementById("info").classList.add("open");

  const statusText = statusLabel(a.authorityLevel);

  let sourcesHtml = "";
  if (Array.isArray(a.sources) && a.sources.length > 0) {
    const list = a.sources.map(s => {
      const isVatican = s.type === "vatican";
      const label = isVatican ? (lang === "pt" ? "Santa Sé" : "Holy See") : (lang === "pt" ? "Documento diocesano" : "Diocesan document");

      const icon = isVatican ? iconVatican() : iconDiocese();

      return `
        <li class="source-item">
          ${icon}
          <span>
            <strong>[${label}]</strong>
            <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">
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

    if (typeof a.visionaries === "object" && !Array.isArray(a.visionaries)) {
      return escapeHtml(
        a.visionaries?.[lang] ||
        a.visionaries?.pt ||
        a.visionaries?.en ||
        "—"
      );
    }

    if (Array.isArray(a.visionaries)) {
      const names = a.visionaries
        .map(v => v?.name?.[lang] || v?.name?.pt || v?.name?.en)
        .filter(Boolean);

      return names.length ? escapeHtml(names.join(", ")) : "—";
    }

    return "—";
  })();

  const statusClass = a.traditionType === "medieval_tradition" ? "medieval_tradition" : a.authorityLevel;
  const imagePath = a.image?.file ? `images/apparitions/${a.image.file}` : "images/apparitions/maria.png";
  const imgTitle = a.name?.[lang] || a.name?.pt || a.name?.en || "Maria";

  const imageHtml = `
    <div class="info-image">
      <img title="${escapeHtml(imgTitle)}" src="${imagePath}" alt="${escapeHtml(a.name[lang])}" onerror="this.parentElement.style.display='none';">
    </div>
  `;

  info.innerHTML = `

    <div class="info-header">
      <button id="closeInfo">✕</button>
    </div>

    ${imageHtml}

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
    updated: "Atualizado em",
    approved_devotion: "Culto aprovado"
  },
  en: {
    total: "Total",
    holy_see: "Holy See",
    diocesan_approved: "Diocesan approved",
    under_investigation: "Under investigation",
    not_recognized: "Not recognized",
    updated: "Updated at",
    approved_devotion: "Approved devotion"
  }
};

const legendLabels = {
  pt: {
    holy_see: "Reconhecida pela Santa Sé",
    diocesan_approved: "Aprovação diocesana",
    approved_devotion: "Culto oficialmente aprovado",
    under_investigation: "Sob investigação",
    not_recognized: "Não reconhecida",
    medieval_tradition: "Tradição histórica"
  },
  en: {
    holy_see: "Recognized by the Holy See",
    diocesan_approved: "Diocesan approval",
    approved_devotion: "Officially approved devotion",
    under_investigation: "Under investigation",
    not_recognized: "Not recognized",
    medieval_tradition: "Historical tradition"
  }
};

window.legendLabels = legendLabels;

function statusLabel(level) {

  const map = {
    holy_see: {
      pt: "Reconhecida pela Santa Sé",
      en: "Recognized by the Holy See"
    },
    diocesan_approved: {
      pt: "Aprovação diocesana",
      en: "Diocesan approval"
    },
    approved_devotion: {
      pt: "Culto oficialmente aprovado",
      en: "Officially approved devotion"
    },
    under_investigation: {
      pt: "Sob investigação",
      en: "Under investigation"
    },
    not_recognized: {
      pt: "Não reconhecida",
      en: "Not recognized"
    }
  };

  return map[level] ? map[level][lang] : "STATUS NÃO MAPEADO";
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

function markerIconByAuthority(authorityLevel, traditionType) {

  let color;

  if (traditionType === "medieval_tradition") {
    color = AUTHORITY_COLORS.medieval_tradition;
  } else {
    color = AUTHORITY_COLORS[authorityLevel] || "#6b6b6b";
  }

  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: authorityLevel === "holy_see" ? 7 : 6,
    fillColor: color,
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

  const legend = document.getElementById("legend");
  if (!legend) return;

  const L = legendLabels[lang] || legendLabels.pt;

  legend.innerHTML = Object.keys(AUTHORITY_COLORS)
    .map(type => legendItem(type, L[type]))
    .join("");
}

function legendItem(type, label) {
  return `
    <div class="legend-item">
      <span class="legend-dot" style="background:${AUTHORITY_COLORS[type]}"></span>
      <span>${label}</span>
    </div>
  `;
}

window.renderLegend = renderLegend;

function populateStatusFilter() {

  const select = document.getElementById("statusFilter");
  const currentValue = select.value;

  const labels = {
    pt: {
      all: "Status",
      holy_see: "Reconhecida pela Santa Sé",
      diocesan_approved: "Aprovação diocesana",
      approved_devotion: "Culto oficialmente aprovado",
      under_investigation: "Sob investigação",
      not_recognized: "Não reconhecida",
      medieval_tradition: "Tradição histórica"
    },
    en: {
      all: "Status",
      holy_see: "Recognized by the Holy See",
      diocesan_approved: "Diocesan approval",
      approved_devotion: "Officially approved devotion",
      under_investigation: "Under investigation",
      not_recognized: "Not recognized",
      medieval_tradition: "Historical tradition"
    }
  };

  select.innerHTML = `
    <option value="all">${labels[lang].all}</option>
    <option value="holy_see">${labels[lang].holy_see}</option>
    <option value="diocesan_approved">${labels[lang].diocesan_approved}</option>
    <option value="approved_devotion">${labels[lang].approved_devotion}</option>
    <option value="under_investigation">${labels[lang].under_investigation}</option>
    <option value="not_recognized">${labels[lang].not_recognized}</option>
    <option value="medieval_tradition">${labels[lang].medieval_tradition}</option>
  `;

  if (currentValue) {
    select.value = currentValue;
  }
}