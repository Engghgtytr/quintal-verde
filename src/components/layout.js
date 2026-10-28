// Topo e rodapé, iguais em todas as páginas (menos no painel do balcão).
import { LOJA } from '../data/cardapio.js';
import { hoursTable } from '../utils/hours.js';
import { esc } from '../utils/dom.js';

export const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true">
  <circle cx="16" cy="16" r="15" fill="#2f6b3f"/>
  <path d="M9 22c0-8 6-13 14-13-.5 8.5-5.5 13.5-14 13Z" fill="#f2f4ec"/>
  <path d="M10 21c3-3.5 6.5-6.2 10.5-8.6" stroke="#2f6b3f" stroke-width="1.6" fill="none" stroke-linecap="round"/>
</svg>`;

export function topoHTML({ rota, mesa }) {
  const link = (href, texto, ativo) => `<a href="${href}"${ativo ? ' aria-current="page"' : ''}>${texto}</a>`;
  return `
  <header class="topo">
    <div class="envelope topo__linha">
      <a class="marca" href="#/">${LOGO}<span>Quintal Verde</span></a>
      <nav class="menu" aria-label="Principal">
        ${link('#/cardapio', 'Cardápio', rota === 'cardapio')}
        ${link('#/?ir=como-funciona', 'Como funciona', false)}
        ${link('#/?ir=onde', 'Onde estamos', false)}
      </nav>
      <div class="topo__acoes">
        ${mesa ? `<span class="mesa-etiqueta">Mesa ${esc(mesa)}</span>` : ''}
        <a class="botao botao--secundario botao--pequeno" id="meu-pedido" href="#" hidden>Pedido<span class="rotulo-largo"> atual</span></a>
        <button class="botao botao--primario botao--pequeno botao-sacola" type="button" data-abrir-sacola aria-label="Abrir sacola, 0 itens">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>
          <span class="rotulo-largo">Sacola</span> <span class="botao-sacola__n" data-sacola-n>0</span>
        </button>
      </div>
    </div>
  </header>`;
}

export function rodapeHTML() {
  const horas = hoursTable(LOJA.horarios).map((h) => `<li>${esc(h.days)}: ${esc(h.value)}</li>`).join('');
  return `
  <footer class="rodape">
    <div class="envelope">
      <div class="rodape__grade">
        <div>
          <a class="marca" href="#/">${LOGO}<span>Quintal Verde</span></a>
          <p class="rodape__frase">Cozinha 100% vegetal: sem carne, sem leite, sem ovo, sem mel.</p>
          <p>${esc(LOJA.endereco)} (endereço fictício)</p>
        </div>
        <div><h2>Horários</h2><ul>${horas}</ul></div>
        <div><h2>Páginas</h2><ul>
          <li><a href="#/cardapio">Cardápio</a></li>
          <li><a href="#/privacidade">Privacidade</a></li>
          <li><a href="#/painel">Painel do balcão</a></li>
        </ul></div>
      </div>
      <p class="rodape__aviso">
        Projeto de portfólio da <strong>Penchel.Dev</strong>. O Quintal Verde é um restaurante fictício: o endereço,
        os preços e os pedidos não são reais. As fotos são ilustrativas, do
        <a href="https://unsplash.com/license" target="_blank" rel="noopener">Unsplash</a>
        (<a href="#/privacidade">créditos das fotos</a>).
      </p>
    </div>
  </footer>`;
}
