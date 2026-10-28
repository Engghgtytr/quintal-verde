// Roteador por "#": cada página devolve o HTML e uma função montar() que liga os eventos
// e devolve uma função para desligar (usada ao trocar de página).
import './styles/base.css';
import './styles/gaveta.css';
import './styles/paginas.css';
import './styles/painel.css';
import { topoHTML, rodapeHTML } from './components/layout.js';
import { abrirSacola } from './components/sacola-gaveta.js';
import * as sacola from './services/sacola.js';
import { meusPedidos } from './services/loja.js';
import * as inicio from './pages/inicio.js';
import * as cardapio from './pages/cardapio.js';
import * as acompanhar from './pages/pedido.js';
import * as painel from './pages/painel.js';
import * as privacidade from './pages/privacidade.js';

const app = document.getElementById('app');
let desligar = () => {};

function lerRota() {
  const [caminho, busca = ''] = location.hash.replace(/^#/, '').split('?');
  const partes = caminho.split('/').filter(Boolean);
  return { partes, params: new URLSearchParams(busca) };
}

const MESA = 'qv:mesa';
function mesaAtual(partes) {
  // Quem entrou pelo QR da mesa continua "na mesa" enquanto a aba estiver aberta.
  if (partes[0] === 'mesa') {
    const n = Number(partes[1]);
    if (Number.isInteger(n) && n >= 1 && n <= 50) {
      try { sessionStorage.setItem(MESA, String(n)); } catch { /* ok */ }
      return n;
    }
  }
  try { return Number(sessionStorage.getItem(MESA)) || null; } catch { return null; }
}

function render() {
  desligar();
  const { partes, params } = lerRota();
  const mesa = mesaAtual(partes);
  let pagina;
  let rota = partes[0] || '';
  if (rota === 'cardapio' || rota === 'mesa') pagina = cardapio;
  else if (rota === 'pedido') pagina = acompanhar;
  else if (rota === 'painel') pagina = painel;
  else if (rota === 'privacidade') pagina = privacidade;
  else { pagina = inicio; rota = ''; }

  const contexto = { partes, params, mesa };
  const semMoldura = pagina === painel;
  app.innerHTML = `
    ${semMoldura ? '' : topoHTML({ rota, mesa })}
    <main id="conteudo" tabindex="-1">${pagina.html(contexto)}</main>
    ${semMoldura ? '' : rodapeHTML()}`;
  document.title = pagina.titulo ? `${pagina.titulo(contexto)} · Quintal Verde` : 'Quintal Verde · cozinha 100% vegetal';
  const parar = pagina.montar(app, contexto) || (() => {});

  const alvo = params.get('ir') || params.get('secao');
  if (alvo) requestAnimationFrame(() => document.getElementById(alvo)?.scrollIntoView());
  else window.scrollTo(0, 0);

  const pararTopo = semMoldura ? () => {} : ligarTopo(mesa);
  desligar = () => { parar(); pararTopo(); };
}

function ligarTopo(mesa) {
  const n = app.querySelector('[data-sacola-n]');
  const botao = app.querySelector('[data-abrir-sacola]');
  const atualizar = () => {
    const q = sacola.quantidade();
    n.textContent = q;
    botao.setAttribute('aria-label', `Abrir sacola, ${q} ${q === 1 ? 'item' : 'itens'}`);
  };
  botao.addEventListener('click', () => abrirSacola({ mesa }));
  const ultimo = meusPedidos().at(-1);
  const meu = app.querySelector('#meu-pedido');
  if (ultimo && !location.hash.includes(ultimo)) { meu.hidden = false; meu.href = `#/pedido/${ultimo}`; }
  atualizar();
  return sacola.aoMudar(atualizar);
}

window.addEventListener('hashchange', render);
render();
