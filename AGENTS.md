# Project guide for coding agents

This repository powers [cette-marque.fr](https://cette-marque.fr/), a French-language database that documents where consumer brands are headquartered, who owns them, and where their products are mainly manufactured.

## Project structure

- `README.md` is the canonical brand database. Do not create a second data source.
- `docs/` contains the GitHub Pages website.
- `docs/app.js` downloads and parses `README.md`, builds the cards and calculates the Géo-score.
- `docs/assets/logos/logos.json` maps brand names to logo metadata.
- `docs/assets/logos/` contains locally stored logos that were explicitly accepted or supplied.
- `docs/score.html` explains the Géo-score.

## Adding or updating brands

Research every entry before editing. Prefer current primary sources in this order:

1. The brand or parent company's official website, legal notices and annual reports.
2. Official company registers and stock-exchange pages.
3. Reliable specialist or news sources when primary sources do not answer the question.

Verify the canonical brand name, official website, headquarters, current ultimate ownership and principal manufacturing countries. Avoid presenting design offices, distributors or historical owners as current ownership.

Add each entry to the country section matching its headquarters. Use these columns exactly:

`Brand | Type | Website | Headquarters | Ownership | Manufacturing | Last checked`

Supported `Type` values currently include `Brand`, `Industrial group`, `Holding company`, `Retailer` and `Brand management company`. Only rows with `Type` equal to `Brand` receive a Géo-score.

Use `YYYY-MM-DD` for `Last checked`, with the actual verification date. Keep every Markdown table aligned in source: pad cells with spaces so all separators in a country table line up.

When ownership mentions another company, link its name to its database anchor, for example:

`🇫🇷 Français ([Groupe SEB](#groupe-seb))`

If that parent company is missing, research and add it as its own entry. Do not make special exceptions for groups that also market a same-named consumer brand; create separate rows when the group and brand are genuinely distinct.

Manufacturing descriptions must distinguish owned factories from suppliers and must not infer a country without evidence. Use concise wording such as `selon les produits` when origins vary. If the available evidence is insufficient for a reliable Géo-score, preserve that uncertainty instead of forcing a letter.

The database intentionally covers physical consumer brands and manufacturers. Do not add software-only companies or services unless the project owner explicitly changes that scope.

## Logos

Add a logo only when it is available on Wikimedia Commons, unless the project owner explicitly supplies or approves an official source.

For Wikimedia Commons, add an object to `docs/assets/logos/logos.json` containing:

- `url`: preferably a `Special:Redirect/file/...` URL;
- `commons_title`;
- `source`: the Commons file page;
- `license`;
- `artist`.

The JSON key must exactly match the brand name in `README.md`. Never substitute a similarly named organization's logo. Validate the JSON after editing.

## Géo-score

Do not store the score in `README.md`; `docs/app.js` calculates it from headquarters, ownership and manufacturing geography.

- A: all three elements are in the same country.
- B: two are in the same country and the third is elsewhere on the same continent.
- C: all three are on the same continent.
- D: two continents are involved.
- E: three continents are involved.

Groups, holdings and retailers do not receive a score. Treat broad or unknown manufacturing descriptions carefully because adding a country or continent name changes the calculated score.

## Website behavior

Brand cards and parent-child brand lists are generated dynamically from `README.md`. Preserve internal ownership links because they drive those relationships. Search and filtering run entirely in the browser, without cookies.

Before changing the site, check its behavior on both desktop and mobile. Avoid per-keystroke work that repeatedly reparses the full Markdown database or rebuilds unnecessary DOM nodes.

## Validation

Before committing:

1. Check `git diff --check`.
2. Confirm affected Markdown tables remain aligned in source.
3. Parse `docs/assets/logos/logos.json` with a JSON validator when it changed.
4. Check that ownership anchors resolve to an existing entry.
5. Review the rendered site when HTML, CSS or JavaScript changed.
6. Preserve unrelated work already present in the worktree.

## Git conventions

Work on the default branch unless instructed otherwise. Synchronize with `origin/main` before editing and again before pushing.

Create one commit per newly added brand or group, using exactly:

`feat(brand): add <brand name>`

Include that brand's logo in the same commit. Use an appropriate Conventional Commit for maintenance work, for example `fix(site): ...`, `style(site): ...`, `docs: ...` or `refactor(data): ...`.

Do not combine several new brands into one commit. Push completed, validated commits to `origin/main` when the user asks to add or update data.
