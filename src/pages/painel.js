// Painel do balcão: pedidos ao vivo, buffet de hoje, esgotar itens e QR codes das mesas.
// Na demonstração não há senha (é tudo no navegador de quem vê). Com o Supabase ligado,
// esta tela fica atrás do login e as regras do banco (RLS) decidem quem pode mudar o quê.
import qrcode from 'qrcode-generator';
import { ITENS, LOJA } from '../data/cardapio.js';
import * as loja from '../services/loja.js';
import { LOGO } from '../components/layout.js';
import { MODOS, PAGAMENTOS, PROXIMO, STATUS, nomesAlergenicos } from '../utils/regras.js';
import { esc } from '../utils/dom.js';
import { formatCents } from '../utils/money.js';
import { toast } from '../components/toast.js';

export const titulo = () => 'Painel do balcão';
const ENTROU = 'qv:painel';
const ABAS = { pedidos: 'Pedidos', buffet: 'Buffet de hoje', esgotar: 'Esgotar itens', qr: 'QR das mesas' };
const BOTAO = { preparando: 'Começar preparo', pronto: 'Marcar pronto', entregue: 'Entregue', cancelado: 'Cancelar' };

export const html = () => `<div class="painel" data-painel></div>`;

const minutos = (iso) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
  return m < 1 ? 'agora' : `há ${m} min`;
};

// QR code em SVG puro (sem estilo inline, para a CSP continuar rígida).
export function qrSVG(texto, rotulo) {
  const q = qrcode(0, 'M');
  q.addData(texto);
  q.make();
  const n = q.getModuleCount();
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${x + 4} ${y + 4}h1v1h-1z`;
  return `<svg viewBox="0 0 ${n + 8} ${n + 8}" role="img" aria-label="${esc(rotulo)}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#1d2b21"/></svg>`;
}

export function montar(raiz) {
  const caixa = raiz.querySelector('[data-painel]');
  let aba = 'pedidos';
  let vivo = true;
  let ocupado = false;
  let ultimaSenha = null;

  const entrou = () => { try { return sessionStorage.getItem(ENTROU) === '1'; } catch { return false; } };

  function portaria() {
    caixa.innerHTML = `
      <div class="portaria">
        <a class="marca" href="#/">${LOGO}<span>Quintal Verde</span></a>
        <h1>Painel do balcão</h1>
        <p>Aqui o balcão vê os pedidos chegando, monta o buffet do dia, marca o que acabou e imprime os QR codes das mesas.</p>
        <p class="aviso-demo">Demonstração: não precisa de senha e tudo fica só neste navegador. Num restaurante de verdade, esta tela tem login e os dados ficam num banco protegido.</p>
        <button class="botao botao--primario" type="button" data-entrar>Entrar na demonstração</button>
      </div>`;
    caixa.querySelector('[data-entrar]').addEventListener('click', () => {
      try { sessionStorage.setItem(ENTROU, '1'); } catch { /* ok */ }
      desenhar();
    });
  }

  async function desenhar() {
    if (!vivo) return;
    if (!entrou()) return portaria();
    const [pedidos, estado] = await Promise.all([loja.pedidosDoDia(), loja.estado()]);
    if (!vivo) return;
    const abertos = pedidos.filter((p) => ['recebido', 'preparando', 'pronto'].includes(p.status));
    const novaSenha = Math.max(0, ...pedidos.map((p) => p.senha));
    if (ultimaSenha !== null && novaSenha > ultimaSenha) toast(`Novo pedido: senha ${novaSenha}`);
    ultimaSenha = novaSenha;

    const foco = document.activeElement?.dataset?.chave; // devolve o foco ao botão equivalente
    caixa.innerHTML = `
      <header class="painel__topo">
        <h1 class="sr-only">Painel do balcão</h1>
        <a class="marca" href="#/">${LOGO}<span>Quintal Verde</span></a>
        <p class="painel__resumo">${abertos.length} ${abertos.length === 1 ? 'pedido aberto' : 'pedidos abertos'} · ${pedidos.length} hoje</p>
        <button class="link" type="button" data-zerar>Zerar demonstração</button>
        <button class="link" type="button" data-sair>Sair</button>
      </header>
      <nav class="painel__abas" role="tablist" aria-label="Seções do painel">
        ${Object.entries(ABAS).map(([id, nome]) => `<button class="painel__aba" type="button" role="tab" aria-selected="${id === aba}" data-aba="${id}" data-chave="aba-${id}">${nome}${id === 'pedidos' && abertos.length ? ` <span class="contador">${abertos.length}</span>` : ''}</button>`).join('')}
      </nav>
      <section class="painel__conteudo" role="tabpanel" aria-label="${ABAS[aba]}">
        ${({ pedidos: abaPedidos, buffet: abaBuffet, esgotar: abaEsgotar, qr: abaQR })[aba](pedidos, estado)}
      </section>`;
    if (foco) caixa.querySelector(`[data-chave="${CSS.escape(foco)}"]`)?.focus();
  }

  function abaPedidos(pedidos) {
    const colunas = ['recebido', 'preparando', 'pronto'];
    const cartao = (p) => `
      <li class="comanda comanda--${p.status}">
        <div class="comanda__topo"><span class="comanda__senha">${p.senha}</span>
          <span class="comanda__onde">${esc(MODOS[p.modo])}${p.mesa ? ` · mesa ${p.mesa}` : ''}</span>
          <span class="comanda__tempo">${minutos(p.criadoEm)}</span></div>
        <p class="comanda__nome">${esc(p.nome)}</p>
        <ul class="comanda__itens" role="list">
          ${p.linhas.map((l) => `<li><strong>${l.qtd}x ${esc(l.nome)}</strong>
            ${l.adicionais.length ? `<span>+ ${esc(l.adicionais.map((a) => a.nome).join(', '))}</span>` : ''}
            ${l.removidos.length ? `<span class="comanda__sem">sem ${esc(l.removidos.join(', '))}</span>` : ''}
            ${l.obs ? `<span>Obs.: ${esc(l.obs)}</span>` : ''}
            ${l.contem.length ? `<span class="comanda__alerg">contém ${esc(nomesAlergenicos(l.contem).join(', '))}</span>` : ''}</li>`).join('')}
        </ul>
        ${p.modo === 'entrega' ? `<p class="comanda__end">${esc(p.endereco)}</p>` : ''}
        <p class="comanda__pag">${formatCents(p.totalCentavos)} · ${esc(PAGAMENTOS[p.pagamento])}${p.trocoCentavos ? ` (troco p/ ${formatCents(p.trocoCentavos)})` : ''}</p>
        <div class="comanda__acoes">
          ${PROXIMO[p.status].map((s) => `<button class="botao ${s === 'cancelado' ? 'botao--secundario' : 'botao--primario'} botao--pequeno" type="button" data-status="${s}" data-id="${esc(p.id)}" data-chave="${esc(p.id)}-${s}">${BOTAO[s]}</button>`).join('')}
        </div>
      </li>`;
    if (!pedidos.length) {
      return `<div class="vazio"><strong>Nenhum pedido hoje ainda.</strong>Abra o <a href="#/mesa/7" target="_blank" rel="noopener">cardápio da mesa 7</a> em outra aba, faça um pedido e ele aparece aqui na hora.</div>`;
    }
    return `
      <div class="quadro-pedidos">
        ${colunas.map((c) => {
          const lista = pedidos.filter((p) => p.status === c);
          return `<div class="coluna"><h2>${STATUS[c]} <span>${lista.length}</span></h2>
            ${lista.length ? `<ul class="comandas" role="list">${lista.map(cartao).join('')}</ul>` : '<p class="coluna__vazia">Nada aqui.</p>'}</div>`;
        }).join('')}
      </div>
      ${pedidos.some((p) => ['entregue', 'cancelado'].includes(p.status)) ? `
        <details class="encerrados"><summary>Entregues e cancelados hoje</summary>
          <ul role="list">${pedidos.filter((p) => ['entregue', 'cancelado'].includes(p.status)).map((p) => `<li>Senha ${p.senha} · ${esc(p.nome)} · ${STATUS[p.status]} · ${formatCents(p.totalCentavos)}</li>`).join('')}</ul>
        </details>` : ''}`;
  }

  function abaBuffet(_, { buffetHoje }) {
    const pratos = ITENS.filter((i) => i.secao === 'buffet');
    return `
      <h2>O que tem no buffet hoje</h2>
      <p class="painel__ajuda">Marque o que está nas travessas. O site e o quadro da página inicial mudam na hora.</p>
      <ul class="interruptores" role="list">
        ${pratos.map((i) => `<li><label class="interruptor"><input type="checkbox" data-buffet="${esc(i.id)}" data-chave="b-${esc(i.id)}" ${buffetHoje.includes(i.id) ? 'checked' : ''} />
          <span><strong>${esc(i.nome)}</strong><small>${i.contem.length ? `contém ${esc(nomesAlergenicos(i.contem).join(', '))}` : 'sem alergênicos comuns'}</small></span></label></li>`).join('')}
      </ul>`;
  }

  function abaEsgotar(_, { esgotados }) {
    const itens = ITENS.filter((i) => i.secao !== 'buffet');
    return `
      <h2>Acabou algum item?</h2>
      <p class="painel__ajuda">Item marcado aparece como "acabou por hoje" e ninguém consegue pedir.</p>
      <ul class="interruptores" role="list">
        ${itens.map((i) => `<li><label class="interruptor${esgotados.includes(i.id) ? ' interruptor--off' : ''}"><input type="checkbox" data-esgotar="${esc(i.id)}" data-chave="e-${esc(i.id)}" ${esgotados.includes(i.id) ? '' : 'checked'} />
          <span><strong>${esc(i.nome)}</strong><small>${esgotados.includes(i.id) ? 'Esgotado' : `Disponível · ${formatCents(i.precoCentavos)}`}</small></span></label></li>`).join('')}
      </ul>`;
  }

  function abaQR() {
    const base = `${location.origin}${location.pathname}`;
    return `
      <h2>QR codes das mesas</h2>
      <p class="painel__ajuda">Imprima e cole em cada mesa. O cliente aponta a câmera e abre o cardápio já com o número da mesa.</p>
      <button class="botao botao--primario botao--pequeno nao-imprime" type="button" data-imprimir>Imprimir</button>
      <ul class="qrs" role="list">
        ${Array.from({ length: LOJA.mesas }, (_, n) => n + 1).map((m) => `
          <li class="qr"><div class="qr__img">${qrSVG(`${base}#/mesa/${m}`, `QR code da mesa ${m}`)}</div>
            <p class="qr__mesa">Mesa ${m}</p><p class="qr__dica">Aponte a câmera para pedir</p></li>`).join('')}
      </ul>`;
  }

  caixa.addEventListener('click', async (e) => {
    const alvo = e.target.closest('button');
    if (!alvo) return;
    if (alvo.dataset.aba) { aba = alvo.dataset.aba; desenhar(); return; }
    if (alvo.hasAttribute('data-sair')) { try { sessionStorage.removeItem(ENTROU); } catch { /* ok */ } desenhar(); return; }
    if (alvo.hasAttribute('data-imprimir')) { window.print(); return; }
    if (alvo.hasAttribute('data-zerar')) {
      if (!confirm('Apagar todos os pedidos e voltar o buffet ao padrão?')) return;
      await loja.zerarDemonstracao();
      toast('Demonstração zerada.');
      desenhar();
      return;
    }
    if (alvo.dataset.status) {
      if (ocupado) return;
      if (alvo.dataset.status === 'cancelado' && !confirm('Cancelar este pedido?')) return;
      ocupado = true;
      alvo.disabled = true;
      try { await loja.mudarStatus(alvo.dataset.id, alvo.dataset.status); } catch (erro) { toast(erro.message); }
      ocupado = false;
      desenhar();
    }
  });
  caixa.addEventListener('change', async (e) => {
    const i = e.target;
    try {
      if (i.dataset.buffet) {
        const marcados = [...caixa.querySelectorAll('[data-buffet]:checked')].map((x) => x.dataset.buffet);
        await loja.definirBuffet(marcados);
      } else if (i.dataset.esgotar) {
        const esgotado = await loja.alternarEsgotado(i.dataset.esgotar);
        toast(esgotado ? 'Marcado como esgotado.' : 'Voltou para o cardápio.');
      }
    } catch (erro) {
      toast('Não deu para salvar. Tente de novo.');
      console.error(erro);
    }
    desenhar();
  });

  desenhar();
  const parar = loja.assinar(desenhar);
  const relogio = setInterval(() => { if (aba === 'pedidos') desenhar(); }, 30000); // atualiza o "há X min"
  return () => { vivo = false; parar(); clearInterval(relogio); };
}
