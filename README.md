# Pokédex TCG Placeholder Generator

A simple Node.js project for Pokémon TCG collectors who want to organize their binders in true Pokédex order — even if they haven’t collected every card yet.

This tool creates a **printable PDF of placeholder cards**, one for each Pokémon in the National Pokédex, using official sprites and Pokédex info scraped directly from [Pokémon Database](https://pokemondb.net/pokedex/national).

---

## ✨ Features

- 🖼️ One card per Pokémon — includes:
  - Name
  - National Pokédex number
  - Official sprite image
- 📄 Standard Pokémon TCG card size (63mm × 88mm)
- 📥 PDF output suitable for printing and slipping into binder sleeves
- 🔄 Always up-to-date with the current National Pokédex
- ⚙️ Fully open-source and scriptable

---

## 🗂 What's Included

| File                    | Purpose                                  |
|-------------------------|-------------------------------------------|
| `scrape_pokemon.js`     | Scrapes Pokémon data from pokemondb.net  |
| `pokemon_data.json`     | JSON data output from scraper            |
| `generate_pdf.js`       | Generates the printable PDF              |
| `pokemon_placeholders.pdf` | Final output with placeholder cards |

---

## 📡 Data Source

All Pokémon data is pulled live from:

🔗 https://pokemondb.net/pokedex/national

Each Pokémon entry includes:

- `id`: National Pokédex number
- `name`: Pokémon name (English)
- `image`: URL to 2x-resolution official sprite

The generated PDF is **always current as of the latest National Pokédex entry** on Pokémon Database at the time of scraping.

---

Make sure to run the scraper first, then run the generator to get the latest data.
