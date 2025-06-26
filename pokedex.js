const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const CARD_WIDTH = 179;  // ~63mm
const CARD_HEIGHT = 249; // ~88mm
const CARDS_PER_PAGE = 6;
const PAGE_WIDTH = 595;  // A4 width in points
const PAGE_HEIGHT = 842; // A4 height in points
const MARGIN = 20;
const H_SPACE = 40;
const V_SPACE = 30;

const MAX_IMG_WIDTH = 120;
const MAX_IMG_HEIGHT = 120;

function sanitizeName(name) {
  if (!name) return 'Unknown';
  return name.replace(/♀/g, ' (F)').replace(/♂/g, ' (M)');
}

function getImageUrl(poke) {
  // Use the image URL from scraped JSON directly (sprite URLs)
  if (poke.image) {
    return poke.image;
  }
  // Fallback to artwork URL if image missing
  const safeName = poke.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
  return `https://img.pokemondb.net/artwork/large/${safeName}.jpg`;
}

async function createPDF(data) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = Math.ceil(data.length / CARDS_PER_PAGE);

  for (let p = 0; p < pages; p++) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    for (let i = 0; i < CARDS_PER_PAGE; i++) {
      const index = p * CARDS_PER_PAGE + i;
      if (index >= data.length) break;

      const poke = data[index];
      const row = Math.floor(i / 2);
      const col = i % 2;

      const x = MARGIN + col * (CARD_WIDTH + H_SPACE);
      const y = PAGE_HEIGHT - MARGIN - (row + 1) * CARD_HEIGHT - row * V_SPACE;

      // Draw card border
      page.drawRectangle({
        x,
        y,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // Draw Pokémon name
      const nameText = sanitizeName(poke.name);
      page.drawText(nameText, {
        x: x + 10,
        y: y + CARD_HEIGHT - 30,
        size: 12,
        font,
      });

      // Draw Pokédex number
      const idText = poke.id ? `Pokédex #${String(poke.id).padStart(3, '0')}` : 'Pokédex #???';
      page.drawText(idText, {
        x: x + 10,
        y: y + 10,
        size: 10,
        font,
      });

      // Load and embed image
      const imgUrl = getImageUrl(poke);

      try {
        const response = await fetch(imgUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const imageBytes = await response.arrayBuffer();
        const ext = imgUrl.split('.').pop().toLowerCase();
        const image = ext === 'png'
          ? await pdfDoc.embedPng(imageBytes)
          : await pdfDoc.embedJpg(imageBytes);

        const { width, height } = image.size();

        // Calculate scale to fit inside max dimensions, preserving aspect ratio
        const widthScale = MAX_IMG_WIDTH / width;
        const heightScale = MAX_IMG_HEIGHT / height;
        const scale = Math.min(widthScale, heightScale, 1);

        const scaledWidth = width * scale;
        const scaledHeight = height * scale;

        // Center image inside card
        page.drawImage(image, {
          x: x + (CARD_WIDTH - scaledWidth) / 2,
          y: y + (CARD_HEIGHT - scaledHeight) / 2,
          width: scaledWidth,
          height: scaledHeight,
        });
      } catch (err) {
        console.warn(`Image failed for ${nameText}: ${err.message}`);
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('pokemon_placeholders.pdf', pdfBytes);
  console.log('PDF saved as pokemon_placeholders.pdf');
}

// Read scraped JSON data from file
const rawData = fs.readFileSync('pokemon_data.json', 'utf8');
const pokemonData = JSON.parse(rawData);

// Sort by Pokédex id ascending (just in case)
const sortedPokemon = pokemonData.sort((a, b) => a.id - b.id);

createPDF(sortedPokemon);
