let lang = document.documentElement.lang || "en";

const translations = {
    pt: {
        title: "Sobre o Projeto",
        subtitle: "Mapa global das aparições marianas: reconhecidas, em investigação e não reconhecidas.",
        objective_text: "Este projeto reúne e organiza visualmente, em um mapa interativo com linha do tempo, os locais associados a alegadas aparições da Virgem Maria ao longo da história. O propósito é documental e informativo.",
        nature_title: "Natureza da Iniciativa",
        nature_text: "Trata-se de uma iniciativa privada desenvolvida por um leigo católico. Não possui vínculo institucional com a Igreja Católica, com a Santa Sé ou com qualquer diocese. Não representa posicionamento oficial da Igreja.",
        criteria_title: "Critério de Classificação",
        scope_title: "Escopo",
        scope_text: "O mapa inclui aparições reconhecidas, casos sob investigação, julgamentos negativos e tradições históricas documentadas. O projeto não promove nem valida eventos — apenas os documenta.",
        limitations_title: "Limitações",
        limitations_text: "O dataset pode conter atualizações pendentes ou revisões futuras. O discernimento oficial da Igreja sempre prevalece sobre qualquer classificação aqui apresentada.",
        footer_text: "Projeto independente, sem vínculo institucional oficial.",
        breadcrumb_home: "Mapa",
        breadcrumb_about: "Sobre",
        criteria_title: "Critérios editoriais",
        criteria_intro: "Este projeto inclui apenas casos com documentação pública verificável e classifica cada registro de forma transparente, sem promover ou validar eventos.",
        criteria_1: "1) Base documental: o registro depende de fontes públicas (por exemplo: decretos diocesanos, comunicados episcopais e documentos do Vaticano).",
        criteria_2: "2) Fontes primárias: quando possível, prioriza-se documentação diocesana oficial e documentos em vatican.va (e fontes oficiais correlatas, como Vatican News).",
        criteria_3: "3) Classificação por status: cada caso recebe um status (Santa Sé, aprovação diocesana, culto aprovado, sob investigação, não reconhecida ou tradição histórica).",
        criteria_4: "4) Rastreabilidade: cada registro aponta fontes canônicas e pode incluir campos como lastReviewedByChurch quando disponível em documentação pública.",
        criteria_5: "5) Neutralidade editorial: o objetivo é catalogar e distinguir níveis de reconhecimento eclesial. O discernimento oficial da Igreja sempre prevalece.",
        contact_title: "Contato e colaboração",
        contact_text: "Para correções, envio de documentação oficial, ajustes de status e contribuições acadêmicas, entre em contato:",
        license_text: "Licença do dataset: conforme definido no _meta do arquivo aparitions.json (uso e redistribuição devem respeitar os termos ali descritos).",
    },
    en: {
        title: "About the Project",
        subtitle: "Global map of Marian apparitions: recognized, under investigation and not recognized.",
        objective_title: "Objective",
        objective_text: "This project visually catalogs locations associated with alleged Marian apparitions throughout history using an interactive map and timeline. Its purpose is documentary and informational.",
        nature_title: "Nature of the Initiative",
        nature_text: "This is a private initiative developed by a Catholic layperson. It has no institutional affiliation with the Catholic Church, the Holy See, or any diocese. It does not represent any official Church position.",
        criteria_title: "Classification Criteria",
        criteria_text: "Each case is categorized according to its ecclesial authority level: Holy See recognition, diocesan approval, under investigation, or not recognized. All information is based exclusively on publicly available documentation.",
        scope_title: "Scope",
        scope_text: "The map includes recognized apparitions, cases under investigation, negative judgments, and documented historical traditions. The project does not endorse or validate events — it documents them.",
        limitations_title: "Limitations",
        limitations_text: "The dataset may contain pending updates or future revisions. Official Church discernment always prevails over any classification presented here.",
        footer_text: "Independent project with no official institutional affiliation.",
        breadcrumb_home: "Map",
        breadcrumb_about: "About",
        criteria_intro: "This project includes only cases with traceable public documentation and classifies each entry transparently, without endorsing or validating events.",
        criteria_1: "1) Documentary basis: entries rely on publicly available ecclesial sources (e.g., diocesan decrees, episcopal statements, and Vatican documents).",
        criteria_2: "2) Primary sources: whenever possible, priority is given to official diocesan documentation and vatican.va (and related official sources such as Vatican News).",
        criteria_3: "3) Status classification: each case receives a status (Holy See, diocesan approval, approved devotion, under investigation, not recognized, or historical tradition).",
        criteria_4: "4) Traceability: each entry includes canonical sources and may include fields like lastReviewedByChurch when available in public documentation.",
        criteria_5: "5) Editorial neutrality: the goal is to catalog and distinguish levels of ecclesial recognition. Official Church discernment always prevails.",
        contact_title: "Contact & collaboration",
        contact_text: "For corrections, official documentation updates, status adjustments, and academic collaboration, please contact:",
        license_text: "Dataset license: as defined in the _meta section of aparitions.json (use and redistribution must follow those terms).",
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