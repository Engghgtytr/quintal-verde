// Sacola e fechamento do pedido. Formulário com os 4 estados:
// vazio (sacola vazia) · carregando (botão trava) · erro (no campo certo) · sucesso (vai para o acompanhamento).
import { abrirGaveta } from './gaveta.js';
import { LOJA } from '../data/cardapio.js';
import * as sacola from '../services/sacola.js';
import * as loja from '../services/loja.js';
import { MODOS, PAGAMENTOS, totais, nomesAlergenicos, LIMITES } from '../utils/regras.js';
import { esc } from '../utils/dom.js';
import { formatCents } from '../utils/money.js';

const RASCUNHO = 'qv:rascunho-pedido';
const lerRascunho = () => { try { return JSON.parse(sessionStorage.getItem(RASCUNHO) || '{}'); } catch { return {}; } };
const gravarRascunho = (d) => { try { sessionStorage.setItem(RASCUNHO, JSON.stringify(d)); } catch { /* ok */ } };

export async function abrirSacola({ mesa = null } = {}) {
  const { esgotados } = await loja.estado();
  const corpo = document.createElement('div');
  const pe = document.createElement('div');
  const rascunho = { modo: mesa ? 'mesa' : 'retirada', pagamento: 'pix', ...lerRascunho() };
  if (mesa) { rascunho.modo = 'mesa'; rascunho.mesa = mesa; }
  let ocupado = false;

  const gaveta = abrirGaveta({ titulo: 'Sua sacola', conteudo: corpo, rodape: pe });

  function desenhar(erros = {}, mensagem = '') {
    const { linhas, invalidas } = sacola.conferidas(esgotados);
    if (!linhas.length) {
      corpo.innerHTML = `<div class="vazio"><strong>Sua sacola está vazia.</strong>Os pratos do buffet você serve no balcão; aqui entram os da cozinha, sucos e sobremesas.</div>`;
      pe.innerHTML = `<a class="botao botao--primario botao--largo" href="#/cardapio?secao=cozinha">Ver o cardápio</a>`;
      pe.querySelector('a').addEventListener('click', () => gaveta.close());
      return;
    }
    const t = totais(linhas, rascunho.modo, rascunho.regiao);
    const campo = (nome) => (erros[nome] ? ` campo--erro` : '');
    const msgErro = (nome) => (erros[nome] ? `<p class="erro-campo" id="erro-${nome}">${esc(erros[nome])}</p>` : '');
    const desc = (nome) => (erros[nome] ? ` aria-invalid="true" aria-describedby="erro-${nome}"` : '');

    corpo.innerHTML = `
      ${invalidas.length ? `<p class="aviso-erro">Algum item acabou e saiu da sacola.</p>` : ''}
      <ul class="sacola-lista" role="list">
        ${linhas.map((l) => `
          <li class="sacola-linha">
            <span class="sacola-linha__nome">${l.qtd}x ${esc(l.nome)}</span>
            <span class="sacola-linha__preco">${formatCents(l.subtotalCentavos)}</span>
            ${[
              l.adicionais.length ? `Com ${l.adicionais.map((a) => esc(a.nome)).join(', ')}` : '',
              l.removidos.length ? `Sem ${l.removidos.map(esc).join(', ')}` : '',
              l.obs ? `Obs.: ${esc(l.obs)}` : '',
              l.contem.length ? `Contém ${esc(nomesAlergenicos(l.contem).join(', '))}` : '',
            ].filter(Boolean).map((d) => `<span class="sacola-linha__det">${d}</span>`).join('')}
            <div class="qtd" role="group" aria-label="Quantidade de ${esc(l.nome)}">
              <button type="button" data-linha="${l.indice}" data-passo="-1" aria-label="${l.qtd === 1 ? 'Remover' : 'Diminuir'}">−</button>
              <output>${l.qtd}</output>
              <button type="button" data-linha="${l.indice}" data-passo="1" aria-label="Aumentar">+</button>
            </div>
          </li>`).join('')}
      </ul>

      <form class="pedido-form" novalidate>
        <fieldset class="campo${campo('modo')}"><legend class="campo__rotulo">Como você quer?</legend>
          <div class="modos">
            ${Object.entries(MODOS).map(([id, nome]) => `
              <label class="modo"><input type="radio" name="modo" value="${id}" ${rascunho.modo === id ? 'checked' : ''} />
                <span><strong>${nome}</strong><small>${{
                  mesa: 'Peça sentado: a gente chama pela senha e você retira no balcão.',
                  retirada: 'Passe no balcão quando a senha aparecer.',
                  entrega: 'Zona oeste, com taxa por região.',
                }[id]}</small></span></label>`).join('')}
          </div>
        </fieldset>

        ${rascunho.modo === 'mesa' ? `
          <div class="campo${campo('mesa')}"><label for="mesa">Número da mesa</label>
            <select id="mesa" name="mesa"${desc('mesa')}>
              <option value="">Escolha</option>
              ${Array.from({ length: LOJA.mesas }, (_, i) => i + 1).map((n) => `<option value="${n}" ${Number(rascunho.mesa) === n ? 'selected' : ''}>Mesa ${n}</option>`).join('')}
            </select>${msgErro('mesa')}</div>` : ''}

        <div class="campo${campo('nome')}"><label for="nome">Seu nome</label>
          <input id="nome" name="nome" autocomplete="given-name" maxlength="${LIMITES.nome}" value="${esc(rascunho.nome || '')}"${desc('nome')} />
          ${msgErro('nome')}</div>

        ${rascunho.modo === 'entrega' ? `
          <div class="campo${campo('regiao')}"><label for="regiao">Região</label>
            <select id="regiao" name="regiao"${desc('regiao')}>
              <option value="">Escolha a região</option>
              ${LOJA.entrega.map((r) => `<option value="${r.id}" ${rascunho.regiao === r.id ? 'selected' : ''}>${esc(r.nome)} · ${formatCents(r.taxaCentavos)}</option>`).join('')}
            </select>${msgErro('regiao')}</div>
          <div class="campo${campo('endereco')}"><label for="endereco">Endereço com número</label>
            <input id="endereco" name="endereco" autocomplete="street-address" maxlength="${LIMITES.endereco}" value="${esc(rascunho.endereco || '')}"${desc('endereco')} />
            ${msgErro('endereco')}</div>` : ''}

        <div class="campo${campo('pagamento')}"><label for="pagamento">Pagamento ${rascunho.modo === 'entrega' ? 'na entrega' : 'no balcão'}</label>
          <select id="pagamento" name="pagamento"${desc('pagamento')}>
            ${Object.entries(PAGAMENTOS).map(([id, nome]) => `<option value="${id}" ${rascunho.pagamento === id ? 'selected' : ''}>${nome}</option>`).join('')}
          </select>${msgErro('pagamento')}</div>

        ${rascunho.pagamento === 'dinheiro' ? `
          <div class="campo${campo('troco')}"><label for="troco">Troco para <small>(opcional)</small></label>
            <input id="troco" name="troco" inputmode="decimal" placeholder="Ex.: 100" value="${esc(rascunho.troco || '')}"${desc('troco')} />
            ${msgErro('troco')}</div>` : ''}
      </form>

      <div class="resumo">
        <div><span>Subtotal</span><span>${formatCents(t.subtotalCentavos)}</span></div>
        ${rascunho.modo === 'entrega' ? `<div><span>Entrega</span><span>${rascunho.regiao ? formatCents(t.taxaCentavos) : 'escolha a região'}</span></div>` : ''}
        <div class="resumo__total"><span>Total</span><span>${formatCents(t.totalCentavos)}</span></div>
      </div>
      <p class="aviso-demo">Demonstração: o pedido chega na tela do balcão deste navegador (abra o painel em outra aba para ver). Nada é cobrado.</p>
      ${mensagem ? `<p class="aviso-erro" role="alert">${esc(mensagem)}</p>` : ''}`;

    pe.innerHTML = `<button class="botao botao--primario botao--largo" type="button" data-enviar>Fazer pedido · ${formatCents(t.totalCentavos)}</button>`;
    pe.querySelector('[data-enviar]').addEventListener('click', enviar);

    const primeiroErro = corpo.querySelector('[aria-invalid="true"]');
    if (primeiroErro) primeiroErro.focus();
  }

  // Guarda o que foi digitado (some ao fechar a aba) e redesenha quando muda o modo ou o pagamento.
  corpo.addEventListener('input', (e) => {
    if (!e.target.name) return;
    rascunho[e.target.name] = e.target.value;
    gravarRascunho({ ...rascunho, mesa: undefined });
  });
  corpo.addEventListener('change', (e) => {
    if (['modo', 'pagamento', 'regiao'].includes(e.target.name)) {
      rascunho[e.target.name] = e.target.value;
      gravarRascunho({ ...rascunho, mesa: undefined });
      const foco = e.target.name;
      desenhar();
      corpo.querySelector(`[name="${foco}"]${foco === 'modo' ? ':checked' : ''}`)?.focus();
    }
  });
  corpo.addEventListener('click', (e) => {
    const b = e.target.closest('[data-passo]');
    if (!b) return;
    const linha = sacola.brutas()[Number(b.dataset.linha)];
    if (linha) sacola.mudarQtd(Number(b.dataset.linha), linha.qtd + Number(b.dataset.passo));
    desenhar();
  });

  async function enviar() {
    if (ocupado) return; // trava de clique duplo (Enter também chega aqui)
    ocupado = true;
    const botao = pe.querySelector('[data-enviar]');
    botao.disabled = true;
    botao.innerHTML = '<span class="spinner" aria-hidden="true"></span> Enviando…';
    try {
      const pedido = await loja.criarPedido(rascunho, sacola.brutas());
      sacola.esvaziar();
      gaveta.close();
      location.hash = `#/pedido/${pedido.id}`;
    } catch (erro) {
      ocupado = false;
      desenhar(erro.campos || {}, erro.campos ? 'Confira os campos destacados.' : erro.message);
    }
  }

  desenhar();
}
