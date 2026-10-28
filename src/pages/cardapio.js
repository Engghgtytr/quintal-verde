// Cardápio: buffet de hoje (só informação) + cozinha, sucos e sobremesas (vão para a sacola).
// Aberto pelo QR (#/mesa/7), mostra o aviso da mesa e o pedido já sai como "comer aqui".
import { FILTROS, ITENS, LOJA, SECOES } from '../data/cardapio.js';
import * as loja from '../services/loja.js';
import { fotoHTML, escolherPrato } from '../components/escolher.js';
import { filtrar, nomesAlergenicos } from '../utils/regras.js';
import { esc } from '../utils/dom.js';
import { formatCents } from '../utils/money.js';

export const titulo = ({ mesa }) => (mesa ? `Cardápio · mesa ${mesa}` : 'Cardápio');

export function html({ mesa }) {
  return `
  <div class="envelope cardapio">
    <header class="cardapio__cabeca">
      <h1>Cardápio</h1>
      ${mesa ? `<p class="aviso-mesa"><strong>Você está na mesa ${esc(mesa)}.</strong> O buffet você serve no balcão. Pratos da cozinha, sucos e sobremesas você pede por aqui e retira quando a senha aparecer.</p>`
             : `<p class="cardapio__lead">Buffet a ${formatCents(LOJA.precoQuiloCentavos)} o quilo. Tudo 100% vegetal; os alergênicos estão em cada prato.</p>`}
      <nav class="secoes" aria-label="Seções do cardápio">
        ${SECOES.map((s) => `<a href="#/cardapio?secao=${s.id}" data-ir="${s.id}">${esc(s.nome)}</a>`).join('')}
      </nav>
      <div class="filtros" role="group" aria-label="Filtrar">
        ${FILTROS.map((f) => `<button class="chip" type="button" aria-pressed="false" data-filtro="${f.id}">${esc(f.nome)}</button>`).join('')}
      </div>
    </header>
    <div data-lista aria-live="polite"></div>
  </div>`;
}

function cartao(i, { buffetHoje, esgotados }) {
  const esgotado = esgotados.includes(i.id);
  const alerg = i.contem.length ? `<span class="selo selo--alergia">Contém ${esc(nomesAlergenicos(i.contem).join(', '))}</span>` : '<span class="selo">Sem alergênicos comuns</span>';
  const org = i.tags.includes('organico') ? '<span class="selo selo--organico">Orgânico</span>' : '';
  if (i.secao === 'buffet') {
    return `
      <li class="prato prato--buffet">
        <div class="prato__corpo">
          <h3>${esc(i.nome)}</h3>
          <p>${esc(i.descricao)}</p>
          <div class="selos">${org}${alerg}</div>
          <details class="prato__ing"><summary>Ingredientes</summary><p>${esc(i.ingredientes.join(', '))}.</p></details>
        </div>
      </li>`;
  }
  return `
    <li class="prato${esgotado ? ' prato--esgotado' : ''}">
      ${i.foto ? fotoHTML(i.foto, `${i.nome} (foto ilustrativa)`, 'prato__foto', '(min-width: 760px) 160px, 112px') : ''}
      <div class="prato__corpo">
        <h3>${esc(i.nome)}</h3>
        <p>${esc(i.descricao)}</p>
        <div class="selos">${esgotado ? '<span class="selo selo--esgotado">Acabou por hoje</span>' : ''}${org}${alerg}</div>
        <div class="prato__pe">
          <span class="preco">${formatCents(i.precoCentavos)}</span>
          <button class="botao botao--secundario botao--pequeno" type="button" data-escolher="${esc(i.id)}" ${esgotado ? 'disabled' : ''}>${esgotado ? 'Esgotado' : 'Escolher'}</button>
        </div>
      </div>
    </li>`;
}

export function montar(raiz) {
  const lista = raiz.querySelector('[data-lista]');
  const ativos = new Set();
  let estado = { buffetHoje: [], esgotados: [] };
  let vivo = true;

  function desenhar() {
    const blocos = SECOES.map((s) => {
      let itens = ITENS.filter((i) => i.secao === s.id && (s.id !== 'buffet' || estado.buffetHoje.includes(i.id)));
      itens = filtrar(itens, [...ativos]);
      return `
        <section class="secao-cardapio" id="${s.id}" aria-labelledby="t-${s.id}">
          <h2 id="t-${s.id}">${esc(s.nome)}</h2>
          <p class="secao-cardapio__desc">${esc(s.descricao)}</p>
          ${itens.length ? `<ul class="pratos${s.id === 'buffet' ? ' pratos--buffet' : ''}" role="list">${itens.map((i) => cartao(i, estado)).join('')}</ul>`
                         : `<p class="vazio">Nenhum prato desta seção com esses filtros. <button class="link" type="button" data-limpar>Limpar filtros</button></p>`}
        </section>`;
    }).join('');
    lista.innerHTML = blocos;
  }

  raiz.querySelector('.filtros').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filtro]');
    if (!b) return;
    const id = b.dataset.filtro;
    if (ativos.has(id)) ativos.delete(id); else ativos.add(id);
    b.setAttribute('aria-pressed', String(ativos.has(id)));
    desenhar();
  });
  lista.addEventListener('click', (e) => {
    const b = e.target.closest('[data-escolher]');
    if (b) escolherPrato(ITENS.find((i) => i.id === b.dataset.escolher));
    if (e.target.closest('[data-limpar]')) {
      ativos.clear();
      raiz.querySelectorAll('[data-filtro]').forEach((f) => f.setAttribute('aria-pressed', 'false'));
      desenhar();
    }
  });
  // Links das seções: rola sem trocar de rota (o # já é usado pelo roteador).
  raiz.querySelector('.secoes').addEventListener('click', (e) => {
    const a = e.target.closest('[data-ir]');
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.dataset.ir)?.scrollIntoView();
  });

  const carregar = async () => {
    estado = await loja.estado();
    if (vivo) desenhar();
  };
  lista.innerHTML = '<p class="vazio">Carregando o cardápio…</p>';
  carregar().then(() => {
    const alvo = new URLSearchParams(location.hash.split('?')[1] || '').get('secao');
    if (alvo) document.getElementById(alvo)?.scrollIntoView();
  });
  const parar = loja.assinar(carregar);
  return () => { vivo = false; parar(); };
}
