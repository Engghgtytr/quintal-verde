// Sacola: o que a pessoa escolheu, guardado no aparelho (sessionStorage) até enviar.
// Guarda só ids e escolhas; o preço é sempre recalculado pelo cardápio (regras.linhaOficial).
import { linhaOficial, LIMITES } from '../utils/regras.js';

const CHAVE = 'qv:sacola';
const ouvintes = new Set();
let linhas = carregar();

function carregar() {
  try { return JSON.parse(sessionStorage.getItem(CHAVE) || '[]'); } catch { return []; }
}
function salvar() {
  try { sessionStorage.setItem(CHAVE, JSON.stringify(linhas)); } catch { /* segue só na memória */ }
  ouvintes.forEach((f) => f());
}

// A mesma escolha (item + adicionais + removidos + obs) soma na quantidade.
const chave = (l) => JSON.stringify([l.itemId, [...l.adicionais].sort(), [...l.removidos].sort(), l.obs || '']);

export function adicionar({ itemId, qtd = 1, adicionais = [], removidos = [], obs = '' }) {
  const nova = { itemId, qtd, adicionais, removidos, obs };
  const igual = linhas.find((l) => chave(l) === chave(nova));
  if (igual) igual.qtd = Math.min(igual.qtd + qtd, LIMITES.qtd);
  else linhas.push(nova);
  salvar();
}

export function mudarQtd(indice, qtd) {
  if (!linhas[indice]) return;
  if (qtd <= 0) linhas.splice(indice, 1);
  else linhas[indice].qtd = Math.min(qtd, LIMITES.qtd);
  salvar();
}

export function esvaziar() {
  linhas = [];
  salvar();
}

export const brutas = () => linhas.map((l) => ({ ...l }));

// Linhas com preço e nome conferidos. Itens que acabaram voltam como `null` em `invalidas`.
export function conferidas(esgotados = []) {
  const ok = [];
  const invalidas = [];
  linhas.forEach((l, indice) => {
    const oficial = linhaOficial(l, esgotados);
    if (oficial) ok.push({ ...oficial, indice });
    else invalidas.push(indice);
  });
  return { linhas: ok, invalidas };
}

export const quantidade = () => linhas.reduce((s, l) => s + l.qtd, 0);

export function aoMudar(f) {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}
