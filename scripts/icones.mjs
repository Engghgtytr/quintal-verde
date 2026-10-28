// Gera o ícone da tela inicial e a imagem de compartilhamento (1200x630).
import sharp from 'sharp';
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#2f6b3f"/><path d="M9 22c0-8 6-13 14-13-.5 8.5-5.5 13.5-14 13Z" fill="#f2f4ec"/><path d="M10 21c3-3.5 6.5-6.2 10.5-8.6" stroke="#2f6b3f" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;
await sharp(Buffer.from(logo)).resize(180, 180).flatten({ background: '#f2f4ec' }).png().toFile('public/apple-touch-icon.png');
const texto = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="620" height="630" fill="#1d2b21"/>
  <text x="64" y="270" font-family="Segoe UI, Arial" font-weight="800" font-size="76" fill="#ffffff">Quintal Verde</text>
  <text x="64" y="340" font-family="Segoe UI, Arial" font-size="34" fill="#d9962b">cozinha 100% vegetal</text>
  <text x="64" y="560" font-family="Segoe UI, Arial" font-size="24" fill="#b9c6b5">Restaurante fictício · projeto de portfólio</text>
</svg>`);
const foto = await sharp('fotos-originais/IGfIGP5ONV0.jpg').resize(580, 630, { fit: 'cover' }).toBuffer();
await sharp(texto).composite([{ input: foto, left: 620, top: 0 }]).jpeg({ quality: 82 }).toFile('public/og-image.jpg');
console.log('ícones ok');
