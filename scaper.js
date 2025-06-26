const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapePokemonDB() {
  const url = 'https://pokemondb.net/pokedex/national';
  console.log(`Fetching ${url} ...`);
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const html = await res.text();

  const $ = cheerio.load(html);

  const pokemonList = [];

  $('.infocard').each((i, el) => {
    const infoData = $(el).find('.infocard-lg-data').text().trim();
    // Extract number from start of text, e.g. "#001 Bulbasaur"
    const idMatch = infoData.match(/^#(\d+)/);
    const id = idMatch ? parseInt(idMatch[1], 10) : null;

    const name = $(el).find('.ent-name').text().trim();
    const image = $(el).find('.infocard-lg-img img').attr('src');

    pokemonList.push({ id, name, image });
  });

  fs.writeFileSync('pokemon_data.json', JSON.stringify(pokemonList, null, 2));
  console.log(`Scraped ${pokemonList.length} Pokémon.`);
  console.log('Saved to pokemon_data.json');
}

scrapePokemonDB().catch(console.error);
