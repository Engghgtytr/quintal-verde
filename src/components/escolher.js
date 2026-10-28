// Gaveta de um prato: foto, ingredientes, alergênicos, adicionais, tirar ingrediente e quantidade.
import { abrirGaveta } from './gaveta.js';
import { adicionar } from '../services/sacola.js';
import { alergenicosDaLinha, nomesAlergenicos, LIMITES } from '../utils/regras.js';
import { esc } from '../utils/dom.js';
import { formatCents } from '../utils/money.js';
import { toast } from './toast.js';

export const fotoHTML = (nome, alt, classe, sizes = '(min-width: 760px) 420px, 92vw', lazy = true) => `
  <img class="${classe}" src="/img/${nome}-480.webp" srcset="/img/${nome}-480.webp 480w, /img/${nome}-960.webp 960w"
       sizes="${sizes}" alt="${esc(alt)}" width="480" height="480"${lazy ? ' loading="lazy"' : ''} decoding="async" />`;

export function escolherPrato(item) {
  const corpo = document.createElement('form');
  corpo.className = 'escolha';
  corpo.noValidate = true;
  corpo.innerHTML = `
    ${item.foto ? fotoHTML(item.foto, `Foto ilustrativa: ${item.nome}`, 'escolha__foto', '(min-width: 760px) 420px, 92vw', false) : ''}
    <p class="escolha__desc">${esc(item.descricao)}</p>
    <p class="escolha__ing"><strong>Ingredientes:</strong> ${esc(item.ingredientes.join(', '))}.</p>
    <p class="escolha__ing" data-alergia></p>
    ${item.adicionais?.length ? `
      <fieldset><legend>Adicionais</legend>
        ${item.adicionais.map((a) => `
          <label class="opcao"><input type="checkbox" name="adicional" value="${esc(a.id)}" />
            <span class="opcao__nome">${esc(a.nome)}</span>
            <span class="opcao__preco">${a.precoCentavos ? `+ ${formatCents(a.precoCentavos)}` : 'grátis'}</span></label>`).join('')}
      </fieldset>` : ''}
    ${item.removiveis?.length ? `
      <fieldset><legend>Tirar algum ingrediente?</legend>
        ${item.removiveis.map((r) => `
          <label class="opcao"><input type="checkbox" name="removido" value="${esc(r)}" />
            <span class="opcao__nome">Sem ${esc(r)}</span></label>`).join('')}
      </fieldset>` : ''}
    <div class="campo">
      <label for="obs">Observação <small>(opcional)</small></label>
      <textarea id="obs" name="obs" maxlength="${LIMITES.obs}" placeholder="Ex.: ponto do pão bem tostado"></textarea>
    </div>`;

  const pe = document.createElement('div');
  pe.className = 'pe-linha';
  pe.innerHTML = `
    <div class="qtd" role="group" aria-label="Quantidade">
      <button type="button" data-qtd="-1" aria-label="Diminuir">−</button><output aria-live="polite">1</output><button type="button" data-qtd="1" aria-label="Aumentar">+</button>
    </div>
    <button class="botao botao--primario" type="button" data-adicionar>Adicionar</button>`;

  let qtd = 1;
  const marcados = (nome) => [...corpo.querySelectorAll(`input[name="${nome}"]:checked`)].map((i) => i.value);
  const atualizar = () => {
    const adicionais = marcados('adicional');
    const unit = item.precoCentavos + (item.adicionais || []).filter((a) => adicionais.includes(a.id)).reduce((s, a) => s + a.precoCentavos, 0);
    pe.querySelector('output').textContent = qtd;
    pe.querySelector('[data-adicionar]').textContent = `Adicionar · ${formatCents(unit * qtd)}`;
    const alerg = alergenicosDaLinha(item, adicionais);
    corpo.querySelector('[data-alergia]').innerHTML = alerg.length
      ? `<strong>Contém:</strong> ${esc(nomesAlergenicos(alerg).join(', '))}.`
      : '<strong>Sem</strong> glúten, castanhas, amendoim, soja e gergelim.';
  };
  corpo.addEventListener('change', atualizar);
  pe.addEventListener('click', (e) => {
    const passo = e.target.closest('[data-qtd]');
    if (passo) { qtd = Math.min(Math.max(1, qtd + Number(passo.dataset.qtd)), LIMITES.qtd); atualizar(); }
  });

  const gaveta = abrirGaveta({ titulo: item.nome, conteudo: corpo, rodape: pe });
  pe.querySelector('[data-adicionar]').addEventListener('click', () => {
    adicionar({ itemId: item.id, qtd, adicionais: marcados('adicional'), removidos: marcados('removido'), obs: corpo.obs.value });
    gaveta.close();
    toast(`${qtd}x ${item.nome} na sacola`);
  });
  atualizar();
}
