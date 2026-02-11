let lang = "pt";

const translations = {
    pt: {
        title: "Sobre o Projeto",
        subtitle: "Mapa global das aparições marianas: reconhecidas, em investigação e não reconhecidas.",
        objective_title: "Objetivo",
        objective_text:
        "Este projeto reúne e organiza visualmente, em um mapa interativo com linha do tempo, os locais associados a alegadas aparições da Virgem Maria ao longo da história. O propósito é documental e informativo.",
        nature_title: "Natureza da Iniciativa",
        nature_text:
        "Trata-se de uma iniciativa privada desenvolvida por um leigo católico. Não possui vínculo institucional com a Igreja Católica, com a Santa Sé ou com qualquer diocese. Não representa posicionamento oficial da Igreja.",
        criteria_title: "Critério de Classificação",
        criteria_text:
        "Cada caso é classificado segundo seu nível de autoridade eclesial: reconhecimento pela Santa Sé, aprovação diocesana, sob investigação ou não reconhecida. As informações são baseadas exclusivamente em documentação pública disponível.",
        scope_title: "Escopo",
        scope_text:
        "O mapa inclui aparições reconhecidas, casos sob investigação, julgamentos negativos e tradições históricas documentadas. O projeto não promove nem valida eventos — apenas os documenta.",
        limitations_title: "Limitações",
        limitations_text:
        "O dataset pode conter atualizações pendentes ou revisões futuras. O discernimento oficial da Igreja sempre prevalece sobre qualquer classificação aqui apresentada.",
        footer_text:
        "Projeto independente, sem vínculo institucional oficial.",
        breadcrumb_home: "Mapa",
        breadcrumb_about: "Sobre",
    },
    en: {
        title: "About the Project",
        subtitle: "Global map of Marian apparitions: recognized, under investigation and not recognized.",
        objective_title: "Objective",
        objective_text:
        "This project visually catalogs locations associated with alleged Marian apparitions throughout history using an interactive map and timeline. Its purpose is documentary and informational.",
        nature_title: "Nature of the Initiative",
        nature_text:
        "This is a private initiative developed by a Catholic layperson. It has no institutional affiliation with the Catholic Church, the Holy See, or any diocese. It does not represent any official Church position.",
        criteria_title: "Classification Criteria",
        criteria_text:
        "Each case is categorized according to its ecclesial authority level: Holy See recognition, diocesan approval, under investigation, or not recognized. All information is based exclusively on publicly available documentation.",
        scope_title: "Scope",
        scope_text:
        "The map includes recognized apparitions, cases under investigation, negative judgments, and documented historical traditions. The project does not endorse or validate events — it documents them.",
        limitations_title: "Limitations",
        limitations_text:
        "The dataset may contain pending updates or future revisions. Official Church discernment always prevails over any classification presented here.",
        footer_text:
        "Independent project with no official institutional affiliation.",
        breadcrumb_home: "Map",
        breadcrumb_about: "About",
    }
};

function setLang(newLang) {
    lang = newLang;
    document.documentElement.lang = newLang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.textContent = translations[lang][key];
    });
}

setLang(lang);