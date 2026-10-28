import { CREDITOS_FOTOS } from '../data/cardapio.js';

export const titulo = () => 'Privacidade';

export const html = () => `
  <article class="envelope texto-pagina">
    <h1>Privacidade</h1>
    <p>O Quintal Verde é um restaurante fictício, criado como projeto de portfólio da Penchel.Dev. Nenhum pedido é feito de verdade e nada é cobrado.</p>

    <h2>O que o site guarda</h2>
    <ul>
      <li>A sacola, o rascunho do pedido e a mesa em que você está: no seu navegador, só enquanto a aba estiver aberta.</li>
      <li>Os pedidos da demonstração (nome, itens e, se escolher entrega, o endereço): no armazenamento do seu próprio navegador. Eles não são enviados para nenhum servidor.</li>
    </ul>

    <h2>O que o site não faz</h2>
    <ul>
      <li>Não usa cookies de rastreamento, Google Analytics nem pixel de anúncio.</li>
      <li>Não pede e-mail, CPF nem dados de cartão.</li>
    </ul>

    <h2>Como apagar</h2>
    <p>Feche a aba para apagar a sacola. Para apagar os pedidos da demonstração, limpe os dados do site no navegador ou use "Zerar demonstração" no painel.</p>

    <h2>Fotos</h2>
    <p>As fotos são ilustrativas, do Unsplash, e podem ser usadas livremente pela <a href="https://unsplash.com/license" target="_blank" rel="noopener">licença Unsplash</a>. Não são pratos deste restaurante. Créditos de cada foto:</p>
    <ul class="creditos">${CREDITOS_FOTOS.map((u, n) => `<li><a href="${u}" target="_blank" rel="noopener">Foto ${n + 1} no Unsplash</a></li>`).join('')}</ul>
  </article>`;

export const montar = () => () => {};
