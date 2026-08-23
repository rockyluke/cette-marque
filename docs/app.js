const state = {
  brands: [],
  logos: {},
  query: "",
  country: "all",
};

const elements = {
  form: document.querySelector("#search-form"),
  input: document.querySelector("#search-input"),
  grid: document.querySelector("#brand-grid"),
  filters: document.querySelector("#country-filters"),
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
    .filter((cells) => cells.length === 6 && cells[0] !== "Brand" && !cells[0].startsWith("---"))
    .map(([name, website, headquarters, ownership, manufacturing, checked]) => ({
      name: plainText(name),
      website,
      headquarters: plainText(headquarters),
      ownership: plainText(ownership),
      ownershipMarkdown: ownership,
      manufacturing: plainText(manufacturing),
      checked,
    }));
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

function ownedBrands(parent) {
  const parentAnchor = `#${brandId(parent.name)}`;
  return state.brands.filter((brand) => {
    const links = [...brand.ownershipMarkdown.matchAll(/\[[^\]]+\]\((#[^)]+)\)/g)];
    return links.some(([, href]) => `#${brandId(href.slice(1))}` === parentAnchor);
  }).sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
}

function matches(brand) {
  const query = normalize(state.query);
  const children = ownedBrands(brand).map(({ name }) => name);
  const haystack = normalize([brand.name, brand.headquarters, brand.ownership, brand.manufacturing, ...children].join(" "));
  return (!query || haystack.includes(query)) && (state.country === "all" || brand.headquarters === state.country);
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
  const children = ownedBrands(brand);
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
  const score = anchoringScore(brand);
  const scoreBadge = fragment.querySelector(".score-badge");
  scoreBadge.textContent = score;
  scoreBadge.classList.add(score === "?" ? "score-unknown" : `score-${score.toLowerCase()}`);
  scoreBadge.title = score === "?" ? "Données géographiques insuffisantes" : `Indice d’ancrage ${score}`;
  fragment.querySelector(".brand-link").href = brand.website;
  return fragment;
}

function render() {
  const visible = state.brands.filter(matches)
    .sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
  elements.grid.replaceChildren(...visible.map(createCard));
  elements.grid.setAttribute("aria-busy", "false");
  elements.empty.hidden = visible.length !== 0;
  elements.grid.hidden = visible.length === 0;
  elements.brandCount.textContent = visible.length;
  elements.brandCountLabel.textContent = visible.length === 1 ? "marque" : "marques";

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.country === state.country));
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

function countryName(value) {
  return value.split(/\s+/).slice(1).join(" ");
}

async function init() {
  try {
    const sourceUrl = new URL("https://raw.githubusercontent.com/rockyluke/cette-marque/main/README.md");
    sourceUrl.searchParams.set("v", Date.now().toString());
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.brands = parseBrands(await response.text())
      .sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
    const logoResponse = await fetch("assets/logos/logos.json", { cache: "no-store" });
    if (logoResponse.ok) state.logos = await logoResponse.json();
    const latest = state.brands.map(({ checked }) => checked).sort().at(-1);
    elements.lastChecked.textContent = formatDate(latest);
    elements.lastChecked.dateTime = latest;
    renderFilters();
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
  render();
});
elements.reset.addEventListener("click", () => {
  state.query = "";
  state.country = "all";
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
