// Converte as fotos de fotos-originais/ (Unsplash) em WebP de 2 tamanhos para public/img/.
// Uso: npm run imagens
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

// arquivo de origem (id do Unsplash) → nome no site, e o recorte (proporção) de cada uso
const FOTOS = [
  ['IGfIGP5ONV0', 'capa', 4 / 5],
  ['KPDbRyFOTnE', 'quintal-mesa', 3 / 2],
  ['eqMHmoe550Y', 'buffet', 3 / 2],
  ['IWv1iwHJdPM', 'feira-rabanete', 4 / 5],
  ['Sya_pQnqx8Y', 'feira-banca', 3 / 2],
  ['Wzo_34cS5bA', 'salao', 3 / 2],
  ['kPLccIMtS8E', 'burger-feijao', 1],
  ['hy8cZtKpHBQ', 'burger-cogumelo', 1],
  ['yhc4pSbl01A', 'bowl-grao', 1],
  ['_pGfJTZi5OE', 'bowl-quinoa', 1],
  ['6UxD0NzDywI', 'rolinho', 1],
  ['1V1HdLlxeq0', 'salada-tofu', 1],
  ['UtcOhVC-3VU', 'salada-figo', 1],
  ['fxJTl_gDh28', 'creme-abobora', 1],
  ['0wn-DdavPa4', 'curry', 1],
  ['VU17nC77iJg', 'suco-verde', 1],
  ['vN1YusQcUJ4', 'suco-frutas', 1],
  ['vm9h4FcvUY4', 'limonada', 1],
  ['B6gIcZsod2Y', 'torta-cacau', 1],
  ['kPxsqUGneXQ', 'bolo-chocolate', 1],
  ['pgA_cCgE5ZU', 'torta-frutas', 1],
];
const TAMANHOS = [480, 960];

mkdirSync('public/img', { recursive: true });
for (const [id, nome, proporcao] of FOTOS) {
  for (const largura of TAMANHOS) {
    await sharp(`fotos-originais/${id}.jpg`)
      .resize(largura, Math.round(largura / proporcao), { fit: 'cover', position: 'attention' })
      .webp({ quality: 72 })
      .toFile(`public/img/${nome}-${largura}.webp`);
  }
  console.log('ok', nome);
}
