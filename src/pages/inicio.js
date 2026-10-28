// Página inicial: capa, selo 100% vegetal, quadro do buffet de hoje, como funciona,
// pratos da cozinha, nossa feira e onde estamos.
import { ITENS, LOJA } from '../data/cardapio.js';
import * as loja from '../services/loja.js';
import { fotoHTML, escolherPrato } from '../components/escolher.js';
import { openStatus, hoursTable } from '../utils/hours.js';
import { nomesAlergenicos } from '../utils/regras.js';
import { esc } from '../utils/dom.js';
import { formatCents } from '../utils/money.js';

const hojeExtenso = (d = new Date()) => d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

export function html() {
  const status = openStatus(LOJA.horarios);
  const cozinha = ITENS.filter((i) => i.secao === 'cozinha');
  return `
  <section class="capa">
    <div class="envelope capa__grade">
      <div class="capa__texto">
        <p class="capa__onde">Cozinha 100% vegetal na Vila Madalena</p>
        <h1>Comida de quintal, servida por quilo.</h1>
        <p class="capa__lead">Buffet que muda todo dia, pratos da cozinha feitos na hora e sucos batidos no momento. Sem carne, sem leite, sem ovo, sem mel.</p>
        <p class="capa__status"><span class="ponto${status.open ? ' ponto--aberto' : ''}" aria-hidden="true"></span>${esc(status.text)} · buffet a ${formatCents(LOJA.precoQuiloCentavos)} o quilo</p>
        <div class="capa__acoes">
          <a class="botao botao--primario" href="#/?ir=quadro">Ver o buffet de hoje</a>
          <a class="botao botao--secundario" href="#/cardapio?secao=cozinha">Pedir da cozinha</a>
        </div>
      </div>
      <figure class="capa__foto">
        ${fotoHTML('capa', 'Prato colorido com grão-de-bico, abacate, tomate, batata-doce e folhas (foto ilustrativa)', 'capa__img', '(min-width: 900px) 46vw, 92vw', false)}
      </figure>
    </div>
  </section>

  <p class="faixa"><span class="envelope">Tudo aqui é de origem vegetal. Os alergênicos de cada prato estão escritos no cardápio.</span></p>

  <section class="quadro-secao" id="quadro" aria-labelledby="quadro-titulo">
    <div class="envelope">
      <div class="quadro" data-quadro>
        <div class="quadro__topo">
          <h2 id="quadro-titulo">Buffet de hoje</h2>
          <p class="quadro__data">${esc(hojeExtenso())}</p>
        </div>
        <ul class="quadro__lista" data-quadro-lista aria-busy="true">
          ${Array.from({ length: 6 }, () => '<li class="quadro__esqueleto"></li>').join('')}
        </ul>
        <div class="quadro__pe">
          <p class="quadro__preco"><span>${formatCents(LOJA.precoQuiloCentavos)}</span> o quilo</p>
          <a class="botao botao--claro" href="#/cardapio?secao=buffet">Ingredientes de cada prato</a>
        </div>
      </div>
    </div>
  </section>

  <section class="secao" id="como-funciona" aria-labelledby="como-titulo">
    <div class="envelope como">
      <div>
        <h2 id="como-titulo">Como funciona o self-service</h2>
        <ol class="passos">
          <li><strong>Monte o prato</strong><span>Sirva-se à vontade no buffet. As plaquinhas dizem o que tem em cada travessa.</span></li>
          <li><strong>Pese no balcão</strong><span>${formatCents(LOJA.precoQuiloCentavos)} o quilo. A balança desconta o prato.</span></li>
          <li><strong>Peça o resto pelo QR da mesa</strong><span>Suco, sobremesa ou um prato da cozinha: pede pelo celular e retira no balcão quando sua senha aparecer.</span></li>
        </ol>
      </div>
      <figure class="como__foto">${fotoHTML('buffet', 'Travessas de saladas lado a lado num buffet (foto ilustrativa)', 'arredondada', '(min-width: 900px) 40vw, 92vw')}</figure>
    </div>
  </section>

  <section class="secao secao--papel" aria-labelledby="cozinha-titulo">
    <div class="envelope">
      <div class="secao__cabeca">
        <h2 id="cozinha-titulo">Da cozinha, feito na hora</h2>
        <a class="link" href="#/cardapio?secao=cozinha">Ver tudo</a>
      </div>
      <ul class="cards" role="list">
        ${cozinha.map((i) => `
          <li class="card">
            ${fotoHTML(i.foto, `${i.nome} (foto ilustrativa)`, 'card__foto', '(min-width: 900px) 270px, (min-width: 600px) 45vw, 92vw')}
            <div class="card__corpo">
              <h3>${esc(i.nome)}</h3>
              <p>${esc(i.descricao)}</p>
              ${i.contem.length ? `<p class="card__alerg">Contém ${esc(nomesAlergenicos(i.contem).join(', '))}</p>` : ''}
              <div class="card__pe"><span class="preco">${formatCents(i.precoCentavos)}</span>
                <button class="botao botao--secundario botao--pequeno" type="button" data-escolher="${esc(i.id)}">Escolher</button></div>
            </div>
          </li>`).join('')}
      </ul>
    </div>
  </section>

  <section class="secao feira" aria-labelledby="feira-titulo">
    <div class="envelope feira__grade">
      <figure class="feira__foto feira__foto--alta">${fotoHTML('feira-rabanete', 'Maços de rabanete e nabo numa banca de feira (foto ilustrativa)', 'arredondada', '(min-width: 900px) 30vw, 92vw')}</figure>
      <div class="feira__texto">
        <h2 id="feira-titulo">O cardápio começa na feira</h2>
        <p>O buffet de cada dia sai do que chegou fresco: se a abóbora está bonita, tem creme de abóbora; se o rabanete chegou, vai para a salada. Por isso ele muda todo dia.</p>
        <p>Nada de carne de mentira com nome comprido. A ideia é comida de casa, feita com vegetal de verdade.</p>
      </div>
      <figure class="feira__foto">${fotoHTML('feira-banca', 'Caixas de feijão-vagem e cenoura numa feira (foto ilustrativa)', 'arredondada', '(min-width: 900px) 30vw, 92vw')}</figure>
    </div>
  </section>

  <section class="secao" id="onde" aria-labelledby="onde-titulo">
    <div class="envelope onde">
      <div>
        <h2 id="onde-titulo">Onde estamos</h2>
        <p class="onde__end">${esc(LOJA.endereco)}<br /><small>Endereço fictício: este restaurante não existe.</small></p>
        <h3>Horários</h3>
        <dl class="horarios">${hoursTable(LOJA.horarios).map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.value)}</dd></div>`).join('')}</dl>
        <h3>Entrega na zona oeste</h3>
        <dl class="horarios">${LOJA.entrega.map((r) => `<div><dt>${esc(r.nome)}</dt><dd>${formatCents(r.taxaCentavos)}</dd></div>`).join('')}</dl>
      </div>
      <figure>${fotoHTML('salao', 'Salão de restaurante com mesas de madeira e luzes penduradas (foto ilustrativa)', 'arredondada', '(min-width: 900px) 48vw, 92vw')}</figure>
    </div>
  </section>`;
}

export function montar(raiz) {
  raiz.querySelectorAll('[data-escolher]').forEach((b) =>
    b.addEventListener('click', () => escolherPrato(ITENS.find((i) => i.id === b.dataset.escolher))));

  // Quadro do buffet: lê o buffet do dia da loja e os pratos entram em cascata uma vez.
  const lista = raiz.querySelector('[data-quadro-lista]');
  let vivo = true;
  const preencher = async () => {
    const { buffetHoje } = await loja.estado();
    if (!vivo) return;
    const pratos = ITENS.filter((i) => buffetHoje.includes(i.id));
    lista.innerHTML = pratos.length
      ? pratos.map((i) => `
        <li class="quadro__item">
          <span class="quadro__nome">${esc(i.nome)}</span>
          <span class="quadro__marcas">${i.tags.includes('organico') ? '<abbr title="orgânico">org.</abbr>' : ''}${i.contem.length ? `<span class="quadro__alerg">${esc(nomesAlergenicos(i.contem).join(', '))}</span>` : ''}</span>
        </li>`).join('')
      : '<li class="quadro__item">O buffet de hoje ainda está sendo montado.</li>';
    // atraso da cascata via CSSOM (a CSP não deixa atributo style no HTML)
    lista.querySelectorAll('.quadro__item').forEach((li, n) => li.style.setProperty('--i', n));
    lista.setAttribute('aria-busy', 'false');
  };
  preencher();
  const quadro = raiz.querySelector('[data-quadro]');
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { quadro.classList.add('quadro--visivel'); obs.disconnect(); }
  }, { rootMargin: '0px 0px -15% 0px' });
  obs.observe(quadro);
  const parar = loja.assinar(preencher);
  return () => { vivo = false; obs.disconnect(); parar(); };
}
