// Acompanhar o pedido: senha grande, etapas e itens. Atualiza sozinho quando o balcão muda o status.
import * as loja from '../services/loja.js';
import { MODOS, PAGAMENTOS, STATUS } from '../utils/regras.js';
import { LOJA } from '../data/cardapio.js';
import { esc } from '../utils/dom.js';
import { formatCents } from '../utils/money.js';

export const titulo = () => 'Seu pedido';

export const html = () => `<div class="envelope acompanhar" data-pedido><p class="vazio">Carregando o pedido…</p></div>`;

const ETAPAS = ['recebido', 'preparando', 'pronto'];
const FRASE = {
  recebido: 'O balcão recebeu seu pedido.',
  preparando: 'Estamos preparando.',
  pronto: 'Pronto! Retire no balcão.',
  entregue: 'Pedido entregue. Bom apetite!',
  cancelado: 'Este pedido foi cancelado. Fale com o balcão.',
};

export function montar(raiz, { partes }) {
  const caixa = raiz.querySelector('[data-pedido]');
  const id = partes[1];
  let statusAnterior = null;
  let vivo = true;

  async function desenhar() {
    const p = await loja.pedido(id);
    if (!vivo) return;
    if (!p) {
      caixa.innerHTML = `<div class="vazio"><strong>Não achamos esse pedido.</strong>Na demonstração, o pedido só existe no navegador em que foi feito. <a href="#/cardapio">Voltar ao cardápio</a></div>`;
      return;
    }
    const pronto = p.status === 'pronto';
    const frase = p.modo === 'entrega' && pronto ? 'Saiu para entrega.' : FRASE[p.status];
    const indice = ETAPAS.indexOf(p.status);
    caixa.innerHTML = `
      <h1 class="sr-only">Seu pedido</h1>
      <div class="senha${pronto ? ' senha--pronta' : ''}" data-senha>
        <p class="senha__rotulo">Sua senha</p>
        <p class="senha__numero">${p.senha}</p>
        <p class="senha__frase" role="status">${esc(frase)}</p>
      </div>
      ${p.status !== 'cancelado' ? `
      <ol class="etapas" aria-label="Andamento">
        ${ETAPAS.map((e, n) => `<li class="${n <= indice || p.status === 'entregue' ? 'feita' : ''}"${e === p.status ? ' aria-current="step"' : ''}>${STATUS[e]}</li>`).join('')}
      </ol>` : ''}
      <section class="acompanhar__det" aria-label="Detalhes do pedido">
        <p><strong>${esc(MODOS[p.modo])}${p.mesa ? ` · mesa ${p.mesa}` : ''}</strong> · ${esc(p.nome)}</p>
        ${p.modo === 'entrega' ? `<p>${esc(p.endereco)}</p>` : ''}
        <ul class="acompanhar__itens" role="list">
          ${p.linhas.map((l) => `<li><span>${l.qtd}x ${esc(l.nome)}${l.adicionais.length ? ` <small>com ${esc(l.adicionais.map((a) => a.nome).join(', '))}</small>` : ''}${l.removidos.length ? ` <small>sem ${esc(l.removidos.join(', '))}</small>` : ''}</span><span>${formatCents(l.subtotalCentavos)}</span></li>`).join('')}
        </ul>
        ${p.taxaCentavos ? `<p class="acompanhar__linha"><span>Entrega</span><span>${formatCents(p.taxaCentavos)}</span></p>` : ''}
        <p class="acompanhar__linha acompanhar__total"><span>Total</span><span>${formatCents(p.totalCentavos)}</span></p>
        <p class="acompanhar__pag">Pagamento ${p.modo === 'entrega' ? 'na entrega' : 'no balcão'}: ${esc(PAGAMENTOS[p.pagamento])}${p.trocoCentavos ? ` (troco para ${formatCents(p.trocoCentavos)})` : ''}</p>
      </section>
      <p class="aviso-demo">Demonstração: para ver a senha mudar, abra o <a href="#/painel" target="_blank" rel="noopener">painel do balcão</a> em outra aba e avance o pedido.</p>
      <div class="acompanhar__acoes"><a class="botao botao--secundario" href="${p.mesa ? `#/mesa/${p.mesa}` : '#/cardapio'}">Pedir mais alguma coisa</a></div>`;

    // Destaque de cor quando o status muda (não é movimento: fica igual com "reduzir movimento").
    if (statusAnterior && statusAnterior !== p.status) caixa.querySelector('[data-senha]').classList.add('senha--mudou');
    statusAnterior = p.status;
    document.title = `Senha ${p.senha}: ${STATUS[p.status]} · ${LOJA.nome}`;
  }

  desenhar();
  const parar = loja.assinar(desenhar);
  return () => { vivo = false; parar(); };
}
