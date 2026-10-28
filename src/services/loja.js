// A "loja": guarda o buffet do dia, os itens esgotados e os pedidos.
//
// MODO DEMONSTRAÇÃO: tudo fica no navegador de quem está vendo (localStorage), e as abas
// abertas conversam por BroadcastChannel. Assim dá para abrir o cardápio numa aba e o
// painel do balcão em outra e ver o pedido chegar. Num restaurante de verdade, esta é a
// única peça que muda: as mesmas funções passam a falar com o Supabase (com RLS).
//
// Tudo aqui é conferido de novo, como faria um servidor: preço recalculado pelo cardápio,
// item esgotado recusado, status só anda para frente.
import { BUFFET_PADRAO, ITENS } from '../data/cardapio.js';
import { limpar, LIMITES, linhaOficial, podeIrPara, totais, validarPedido, lerDinheiro } from '../utils/regras.js';

const CHAVE = 'qv:loja:v1';
const MEUS = 'qv:meus-pedidos';
const canal = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('quintal-verde') : null;

function vazio() {
  return { buffetHoje: [...BUFFET_PADRAO], esgotados: [], pedidos: [], senha: { dia: '', n: 0 } };
}

let memoria = null; // se o navegador bloquear o armazenamento, a demonstração segue na memória
function ler(armazenamento = globalThis.localStorage) {
  try {
    const bruto = armazenamento?.getItem(CHAVE);
    if (bruto) return { ...vazio(), ...JSON.parse(bruto) };
  } catch { /* armazenamento bloqueado ou dado estragado: começa do zero */ }
  return memoria ? structuredClone(memoria) : vazio();
}
function gravar(estado, armazenamento = globalThis.localStorage) {
  memoria = structuredClone(estado);
  try { armazenamento?.setItem(CHAVE, JSON.stringify(estado)); } catch { /* segue na memória */ }
  canal?.postMessage('mudou');
}

const hojeISO = (agora) => agora.toLocaleDateString('sv-SE'); // AAAA-MM-DD no fuso do aparelho
const idsValidos = new Set(ITENS.map((i) => i.id));
const espera = () => new Promise((r) => setTimeout(r, 0)); // mesma "forma" de uma chamada de rede

export async function estado() {
  await espera();
  const { buffetHoje, esgotados } = ler();
  return { buffetHoje, esgotados };
}

export async function criarPedido(form, linhasDaSacola, agora = new Date()) {
  await espera();
  const est = ler();
  const linhas = linhasDaSacola.map((l) => linhaOficial(l, est.esgotados));
  if (linhas.some((l) => l === null)) {
    throw new Error('Um item da sacola acabou ou mudou. Confira a sacola e tente de novo.');
  }
  const erros = validarPedido(form, linhas);
  if (Object.keys(erros).length) {
    const e = new Error('Confira os campos destacados.');
    e.campos = erros;
    throw e;
  }
  const dia = hojeISO(agora);
  if (est.senha.dia !== dia) est.senha = { dia, n: 0 };
  est.senha.n += 1;

  const t = totais(linhas, form.modo, form.regiao);
  const pedido = {
    id: crypto.randomUUID(),
    senha: est.senha.n,
    criadoEm: agora.toISOString(),
    modo: form.modo,
    mesa: form.modo === 'mesa' ? Number(form.mesa) : null,
    nome: limpar(form.nome, LIMITES.nome),
    endereco: form.modo === 'entrega' ? limpar(form.endereco, LIMITES.endereco) : '',
    regiao: form.modo === 'entrega' ? form.regiao : null,
    pagamento: form.pagamento,
    trocoCentavos: form.pagamento === 'dinheiro' ? lerDinheiro(form.troco) : null,
    linhas,
    ...t,
    status: 'recebido',
    historico: [{ status: 'recebido', em: agora.toISOString() }],
  };
  est.pedidos.push(pedido);
  est.pedidos = est.pedidos.slice(-200); // a demonstração não cresce para sempre
  gravar(est);
  guardarMeu(pedido.id);
  return pedido;
}

export async function pedido(id) {
  await espera();
  return ler().pedidos.find((p) => p.id === id) || null;
}

export async function pedidosDoDia(agora = new Date()) {
  await espera();
  const dia = hojeISO(agora);
  return ler().pedidos.filter((p) => hojeISO(new Date(p.criadoEm)) === dia);
}

export async function mudarStatus(id, novo, agora = new Date()) {
  await espera();
  const est = ler();
  const p = est.pedidos.find((x) => x.id === id);
  if (!p) throw new Error('Pedido não encontrado.');
  if (!podeIrPara(p.status, novo)) throw new Error('Esse pedido já mudou. A tela foi atualizada.');
  p.status = novo;
  p.historico.push({ status: novo, em: agora.toISOString() });
  gravar(est);
  return p;
}

export async function definirBuffet(ids) {
  await espera();
  const est = ler();
  est.buffetHoje = ids.filter((id) => idsValidos.has(id) && ITENS.find((i) => i.id === id).secao === 'buffet');
  gravar(est);
}

export async function alternarEsgotado(id) {
  await espera();
  if (!idsValidos.has(id)) throw new Error('Item não encontrado.');
  const est = ler();
  est.esgotados = est.esgotados.includes(id) ? est.esgotados.filter((x) => x !== id) : [...est.esgotados, id];
  gravar(est);
  return est.esgotados.includes(id);
}

export async function zerarDemonstracao() {
  await espera();
  gravar(vazio());
}

// Chama `aoMudar` quando outra aba (ou esta) mudar a loja.
export function assinar(aoMudar) {
  const porCanal = () => aoMudar();
  const porStorage = (e) => { if (e.key === CHAVE) aoMudar(); };
  canal?.addEventListener('message', porCanal);
  globalThis.addEventListener?.('storage', porStorage);
  return () => {
    canal?.removeEventListener('message', porCanal);
    globalThis.removeEventListener?.('storage', porStorage);
  };
}

// Pedidos feitos neste aparelho (para o link "seu pedido" no topo).
function guardarMeu(id) {
  try {
    const lista = JSON.parse(localStorage.getItem(MEUS) || '[]').slice(-9);
    localStorage.setItem(MEUS, JSON.stringify([...lista, id]));
  } catch { /* sem armazenamento: só não aparece o atalho */ }
}
export function meusPedidos() {
  try { return JSON.parse(localStorage.getItem(MEUS) || '[]'); } catch { return []; }
}

export const _teste = { ler, gravar, vazio, CHAVE };
