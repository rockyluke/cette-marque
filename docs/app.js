const state = {
  brands: [],
  logos: {},
  query: "",
  country: "all",
  score: "all",
  cards: new Map(),
  renderFrame: null,
};

const elements = {
  form: document.querySelector("#search-form"),
  input: document.querySelector("#search-input"),
  grid: document.querySelector("#brand-grid"),
  filters: document.querySelector("#country-filters"),
  scoreFilters: document.querySelector("#score-filters"),
  brandCount: document.querySelector("#brand-count"),
  brandCountLabel: document.querySelector("#brand-count-label"),
  lastChecked: document.querySelector("#last-checked"),
  empty: document.querySelector("#empty-state"),
  reset: document.querySelector("#reset-search"),
  template: document.querySelector("#brand-card-template"),
};

function markdownText(value) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "");
}

function plainText(value) {
  return markdownText(value).trim();
}

function parseBrands(markdown) {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("| "))
    .map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim()))
    .filter((cells) => (cells.length === 6 || cells.length === 7) && cells[0] !== "Brand" && !cells[0].startsWith("---"))
    .map((cells) => {
      const [name, type, website, headquarters, ownership, manufacturing, checked] = cells.length === 7
        ? cells
        : [cells[0], "Brand", ...cells.slice(1)];
      return {
        name: plainText(name),
        type: plainText(type),
        website,
        headquarters: plainText(headquarters),
        ownership: plainText(ownership),
        ownershipMarkdown: ownership,
        manufacturing: plainText(manufacturing),
        checked,
      };
    });
}

function renderMarkdownLinks(element, markdown) {
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let cursor = 0;
  let match;

  while ((match = pattern.exec(markdown)) !== null) {
    element.append(document.createTextNode(markdownText(markdown.slice(cursor, match.index))));
    const href = match[2];

    if (href.startsWith("https://") || href.startsWith("http://") || href.startsWith("#")) {
      const link = document.createElement("a");
      const boldLabel = match[1].match(/^\*\*(.+)\*\*$/);
      if (boldLabel) {
        const strong = document.createElement("strong");
        strong.textContent = boldLabel[1];
        link.append(strong);
      } else {
        link.textContent = markdownText(match[1]);
      }
      link.href = href.startsWith("#") ? `#${brandId(href.slice(1))}` : href;
      if (!href.startsWith("#")) {
        link.target = "_blank";
        link.rel = "noreferrer";
      }
      element.append(link);
    } else {
      element.append(document.createTextNode(match[1]));
    }

    cursor = pattern.lastIndex;
  }

  element.append(document.createTextNode(markdownText(markdown.slice(cursor))));
}

function normalize(value) {
  return value.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function brandId(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const countryContinents = {
  "🇩🇿": "Afrique", "🇿🇦": "Afrique", "🇹🇳": "Afrique", "🇲🇦": "Afrique", "🇪🇬": "Afrique", "🇲🇬": "Afrique",
  "🇦🇺": "Océanie", "🇳🇿": "Océanie",
  "🇦🇹": "Europe", "🇩🇪": "Europe", "🇧🇪": "Europe", "🇧🇬": "Europe", "🇩🇰": "Europe",
  "🇪🇸": "Europe", "🇫🇮": "Europe", "🇫🇷": "Europe", "🇮🇪": "Europe", "🇮🇸": "Europe",
  "🇮🇹": "Europe", "🇱🇺": "Europe", "🇲🇨": "Europe", "🇳🇴": "Europe", "🇳🇱": "Europe",
  "🇵🇱": "Europe", "🇵🇹": "Europe", "🇬🇧": "Europe", "🇸🇪": "Europe", "🇨🇭": "Europe",
  "🇨🇿": "Europe", "🇹🇷": "Asie", "🇷🇴": "Europe", "🇭🇺": "Europe", "🇪🇪": "Europe",
  "🇲🇹": "Europe", "🇲🇩": "Europe", "🇸🇰": "Europe",
  "🇨🇦": "Amérique", "🇺🇸": "Amérique", "🇲🇽": "Amérique", "🇧🇷": "Amérique", "🇦🇷": "Amérique",
  "🇨🇳": "Asie", "🇭🇰": "Asie", "🇮🇳": "Asie", "🇯🇵": "Asie", "🇵🇰": "Asie", "🇹🇼": "Asie",
  "🇻🇳": "Asie", "🇵🇭": "Asie", "🇮🇱": "Asie", "🇧🇩": "Asie", "🇰🇭": "Asie", "🇱🇰": "Asie",
  "🇸🇬": "Asie",
};

const countryNames = {
  "afrique du sud": "🇿🇦", algerie: "🇩🇿", tunisie: "🇹🇳", maroc: "🇲🇦", egypte: "🇪🇬", madagascar: "🇲🇬",
  australie: "🇦🇺", "nouvelle-zelande": "🇳🇿", autriche: "🇦🇹", allemagne: "🇩🇪", belgique: "🇧🇪",
  bulgarie: "🇧🇬", danemark: "🇩🇰", espagne: "🇪🇸", finlande: "🇫🇮", france: "🇫🇷", irlande: "🇮🇪",
  islande: "🇮🇸", italie: "🇮🇹", luxembourg: "🇱🇺", monaco: "🇲🇨", norvege: "🇳🇴", "pays-bas": "🇳🇱",
  pologne: "🇵🇱", portugal: "🇵🇹", "royaume-uni": "🇬🇧", suede: "🇸🇪", suisse: "🇨🇭", tchequie: "🇨🇿",
  turquie: "🇹🇷", roumanie: "🇷🇴", hongrie: "🇭🇺", estonie: "🇪🇪", malte: "🇲🇹", moldavie: "🇲🇩",
  slovaquie: "🇸🇰", canada: "🇨🇦", "etats-unis": "🇺🇸", mexique: "🇲🇽", bresil: "🇧🇷", argentine: "🇦🇷",
  chine: "🇨🇳", "hong-kong": "🇭🇰", inde: "🇮🇳", japon: "🇯🇵", pakistan: "🇵🇰", taiwan: "🇹🇼",
  vietnam: "🇻🇳", philippines: "🇵🇭", israel: "🇮🇱", bangladesh: "🇧🇩", cambodge: "🇰🇭", "sri-lanka": "🇱🇰",
  singapour: "🇸🇬",
};

function mentionsCountry(normalizedValue, country) {
  return `-${normalizedValue}-`.includes(`-${country}-`);
}

function firstCountry(value) {
  const flag = Object.keys(countryContinents).find((candidate) => value.includes(candidate));
  if (flag) return flag;
  const normalized = normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return Object.entries(countryNames).find(([name]) => mentionsCountry(normalized, name))?.[1] || null;
}

function manufacturingGeography(value) {
  const normalized = normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const countries = new Set(Object.keys(countryContinents).filter((flag) => value.includes(flag)));
  Object.entries(countryNames).forEach(([name, flag]) => {
    if (mentionsCountry(normalized, name)) countries.add(flag);
  });
  const continents = new Set([...countries].map((flag) => countryContinents[flag]));
  if (value.includes("🇪🇺") || normalized.includes("europe")) continents.add("Europe");
  if (normalized.includes("asie")) continents.add("Asie");
  if (normalized.includes("afrique")) continents.add("Afrique");
  if (normalized.includes("amerique")) continents.add("Amérique");
  if (normalized.includes("oceanie")) continents.add("Océanie");
  const broadRegion = value.includes("🇪🇺")
    || ["europe", "asie", "afrique", "amerique", "oceanie"].some((region) => normalized.includes(region));
  return { countries, continents, broadRegion };
}

function anchoringScore(brand) {
  const headquarters = firstCountry(brand.headquarters);
  const ownership = firstCountry(brand.ownership);
  const manufacturing = manufacturingGeography(brand.manufacturing);
  if (!headquarters || !ownership || manufacturing.continents.size === 0) return "?";

  const headquartersContinent = countryContinents[headquarters];
  const ownershipContinent = countryContinents[ownership];
  const continents = new Set([headquartersContinent, ownershipContinent, ...manufacturing.continents]);
  const manufacturingOnlyInHeadquarters = manufacturing.countries.size > 0
    && [...manufacturing.countries].every((country) => country === headquarters)
    && manufacturing.continents.size === 1
    && !manufacturing.broadRegion;

  if (headquarters === ownership && manufacturingOnlyInHeadquarters) return "A";
  if (headquarters === ownership && continents.size === 1) return "B";
  if (continents.size === 1) return "C";
  if (continents.size === 2) return "D";
  return "E";
}

function prepareBrands() {
  const brandsById = new Map(state.brands.map((brand) => [brandId(brand.name), brand]));

  state.brands.forEach((brand) => {
    brand.children = [];
    brand.score = brand.type === "Brand" ? anchoringScore(brand) : null;
  });

  state.brands.forEach((brand) => {
    for (const [, href] of brand.ownershipMarkdown.matchAll(/\[[^\]]+\]\((#[^)]+)\)/g)) {
      const parent = brandsById.get(brandId(href.slice(1)));
      if (parent) parent.children.push(brand);
    }
  });

  state.brands.forEach((brand) => {
    brand.children.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
    brand.searchText = normalize([
      brand.name,
      brand.type,
      brand.headquarters,
      brand.ownership,
      brand.manufacturing,
      ...brand.children.map(({ name }) => name),
    ].join(" "));
  });
}

function matches(brand, query) {
  const scoreEligible = brand.type === "Brand";
  const scoreMatches = state.score === "all" || (scoreEligible && brand.score === state.score);
  return (!query || brand.searchText.includes(query))
    && (state.country === "all" || brand.headquarters === state.country)
    && scoreMatches;
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function createCard(brand, index) {
  const fragment = elements.template.content.cloneNode(true);
  const card = fragment.querySelector(".brand-card");
  card.id = brandId(brand.name);
  card.style.animationDelay = `${Math.min(index, 12) * 35}ms`;
  fragment.querySelector("h3").textContent = brand.name;
  const logo = state.logos[brand.name];
  if (logo) {
    const logoLink = fragment.querySelector(".brand-logo");
    const logoImage = logoLink.querySelector("img");
    logoLink.hidden = false;
    logoLink.href = logo.source;
    logoLink.title = `Logo de ${brand.name} — consulter la source`;
    if (logo.background) logoLink.style.background = logo.background;
    logoImage.src = logo.url || `assets/logos/${logo.file}`;
    logoImage.alt = `Logo ${brand.name}`;
  }
  fragment.querySelector(".headquarters").textContent = brand.headquarters;
  fragment.querySelector(".checked").textContent = brand.checked;
  fragment.querySelector(".checked").dateTime = brand.checked;
  renderMarkdownLinks(fragment.querySelector(".ownership"), brand.ownershipMarkdown);
  fragment.querySelector(".manufacturing").textContent = brand.manufacturing;
  const children = brand.children;
  if (children.length > 0) {
    const brandsRow = fragment.querySelector(".owned-brands");
    const brandsList = brandsRow.querySelector("dd");
    children.forEach((child, childIndex) => {
      if (childIndex) brandsList.append(document.createTextNode(", "));
      const link = document.createElement("a");
      link.href = `#${brandId(child.name)}`;
      link.textContent = child.name;
      brandsList.append(link);
    });
    brandsRow.hidden = false;
  }
  const scoreRow = fragment.querySelector(".score-row");
  const scoreEligible = brand.type === "Brand";
  if (scoreEligible) {
    const score = brand.score;
    const scoreBadge = scoreRow.querySelector(".score-badge");
    scoreBadge.textContent = score;
    scoreBadge.classList.add(score === "?" ? "score-unknown" : `score-${score.toLowerCase()}`);
    scoreBadge.title = score === "?" ? "Données géographiques insuffisantes" : `Géo-score ${score}`;
  } else {
    scoreRow.hidden = true;
  }
  fragment.querySelector(".brand-link").href = brand.website;
  return card;
}

function render() {
  const query = normalize(state.query);
  const visible = state.brands.filter((brand) => matches(brand, query));
  elements.grid.replaceChildren(...visible.map((brand, index) => {
    if (!state.cards.has(brand.name)) state.cards.set(brand.name, createCard(brand, index));
    return state.cards.get(brand.name);
  }));
  elements.grid.setAttribute("aria-busy", "false");
  elements.empty.hidden = visible.length !== 0;
  elements.grid.hidden = visible.length === 0;
  elements.brandCount.textContent = visible.length;
  elements.brandCountLabel.textContent = visible.length === 1 ? "marque" : "marques";

  document.querySelectorAll(".filter-button").forEach((button) => {
    const selected = button.dataset.country
      ? button.dataset.country === state.country
      : button.dataset.score === state.score;
    button.setAttribute("aria-pressed", String(selected));
  });
}

function scheduleRender() {
  if (state.renderFrame !== null) cancelAnimationFrame(state.renderFrame);
  state.renderFrame = requestAnimationFrame(() => {
    state.renderFrame = null;
    render();
  });
}

function renderFilters() {
  const countries = [...new Set(state.brands.map((brand) => brand.headquarters))]
    .sort((a, b) => countryName(a).localeCompare(countryName(b), "fr"));

  const options = [{ label: "Tous", value: "all" }, ...countries.map((country) => ({ label: country, value: country }))];
  elements.filters.replaceChildren(...options.map(({ label, value }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.dataset.country = value;
    button.textContent = label;
    button.setAttribute("aria-pressed", String(value === state.country));
    button.addEventListener("click", () => {
      state.country = value;
      render();
    });
    return button;
  }));
}

function renderScoreFilters() {
  const options = [
    { label: "Tous les scores", value: "all" },
    ...["A", "B", "C", "D", "E", "?"].map((score) => ({ label: score, value: score })),
  ];
  elements.scoreFilters.replaceChildren(...options.map(({ label, value }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button score-filter-button";
    button.dataset.score = value;
    button.textContent = label;
    if (value !== "all") button.classList.add(value === "?" ? "score-unknown" : `score-${value.toLowerCase()}`);
    button.setAttribute("aria-pressed", String(value === state.score));
    button.addEventListener("click", () => {
      state.score = value;
      render();
    });
    return button;
  }));
}

function countryName(value) {
  return value.split(/\s+/).slice(1).join(" ");
}

async function init() {
  try {
    const sourceUrl = new URL("https://raw.githubusercontent.com/rockyluke/cette-marque/main/README.md");
    sourceUrl.searchParams.set("schema", "2");
    sourceUrl.searchParams.set("v", Date.now().toString());
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.brands = parseBrands(await response.text())
      .sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
    const logoResponse = await fetch("assets/logos/logos.json", { cache: "no-store" });
    if (logoResponse.ok) state.logos = await logoResponse.json();
    prepareBrands();
    const latest = state.brands.map(({ checked }) => checked).sort().at(-1);
    elements.lastChecked.textContent = formatDate(latest);
    elements.lastChecked.dateTime = latest;
    renderFilters();
    renderScoreFilters();
    render();
  } catch (error) {
    elements.grid.setAttribute("aria-busy", "false");
    elements.grid.innerHTML = `<p>La base n’a pas pu être chargée. <a href="https://github.com/rockyluke/cette-marque/blob/main/README.md">Consulter le fichier source</a>.</p>`;
    console.error(error);
  }
}

elements.form.addEventListener("submit", (event) => event.preventDefault());
elements.input.addEventListener("input", (event) => {
  state.query = event.target.value.trim();
  scheduleRender();
});
elements.reset.addEventListener("click", () => {
  state.query = "";
  state.country = "all";
  state.score = "all";
  elements.input.value = "";
  elements.input.focus();
  render();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== elements.input) {
    event.preventDefault();
    elements.input.focus();
  }
  if (event.key === "Escape" && document.activeElement === elements.input) {
    elements.input.value = "";
    state.query = "";
    render();
    elements.input.blur();
  }
});

init();
