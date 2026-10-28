// Regras do cardápio e do pedido. São funções puras (sem tela e sem banco), testadas em
// tests/regras.test.js e usadas tanto pela sacola quanto pela "loja" (services/loja.js).
import { ALERGENICOS, FILTROS, ITENS, LOJA } from '../data/cardapio.js';

export const PAGAMENTOS = {
  pix: 'Pix',
  cartao: 'Cartão',
  vr: 'Vale-refeição',
  dinheiro: 'Dinheiro',
};
export const MODOS = {
  mesa: 'Comer aqui',
  retirada: 'Retirar no balcão',
  entrega: 'Entrega',
};
export const STATUS = {
  recebido: 'Pedido recebido',
  preparando: 'Em preparo',
  pronto: 'Pronto',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};
// Para onde cada status pode ir (o painel só oferece esses botões, e a loja confere de novo).
export const PROXIMO = {
  recebido: ['preparando', 'cancelado'],
  preparando: ['pronto', 'cancelado'],
  pronto: ['entregue'],
  entregue: [],
  cancelado: [],
};
export const LIMITES = { nome: 60, endereco: 160, obs: 140, qtd: 20, linhas: 30 };

const porId = new Map(ITENS.map((i) => [i.id, i]));
export const item = (id) => porId.get(id);

// Tira quebras de linha e caracteres de controle e corta no tamanho máximo.
export const limpar = (valor, max = 200) =>
  String(valor ?? '')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

export function filtrar(itens, filtrosAtivos) {
  const ativos = FILTROS.filter((f) => filtrosAtivos.includes(f.id));
  return itens.filter((i) => ativos.every((f) => f.passa(i)));
}

export const nomesAlergenicos = (lista) => lista.map((a) => ALERGENICOS[a] || a);

// Alergênicos do prato montado: os do prato + os dos adicionais escolhidos.
export function alergenicosDaLinha(it, adicionaisIds = []) {
  const extras = (it.adicionais || []).filter((a) => adicionaisIds.includes(a.id)).flatMap((a) => a.contem);
  return [...new Set([...it.contem, ...extras])];
}

// Confere uma linha da sacola contra o cardápio e devolve a versão "oficial", com preço
// calculado aqui (nunca confia no preço que veio do navegador). Linha inválida → null.
export function linhaOficial(linha, esgotados = []) {
  const it = item(linha?.itemId);
  if (!it || it.secao === 'buffet' || esgotados.includes(it.id)) return null;
  const qtd = Math.trunc(Number(linha.qtd));
  if (!Number.isFinite(qtd) || qtd < 1 || qtd > LIMITES.qtd) return null;
  const adicionais = (it.adicionais || []).filter((a) => (linha.adicionais || []).includes(a.id));
  const removidos = (it.removiveis || []).filter((r) => (linha.removidos || []).includes(r));
  const unitario = it.precoCentavos + adicionais.reduce((s, a) => s + a.precoCentavos, 0);
  return {
    itemId: it.id,
    nome: it.nome,
    qtd,
    adicionais: adicionais.map(({ id, nome, precoCentavos }) => ({ id, nome, precoCentavos })),
    removidos,
    obs: limpar(linha.obs, LIMITES.obs),
    unitarioCentavos: unitario,
    subtotalCentavos: unitario * qtd,
    contem: alergenicosDaLinha(it, adicionais.map((a) => a.id)),
  };
}

export function taxaEntrega(modo, regiaoId) {
  if (modo !== 'entrega') return 0;
  return LOJA.entrega.find((r) => r.id === regiaoId)?.taxaCentavos ?? null;
}

export function totais(linhas, modo, regiaoId) {
  const subtotalCentavos = linhas.reduce((s, l) => s + l.subtotalCentavos, 0);
  const taxaCentavos = taxaEntrega(modo, regiaoId) ?? 0;
  return { subtotalCentavos, taxaCentavos, totalCentavos: subtotalCentavos + taxaCentavos };
}

// "100", "100,50", "R$ 1.000,00" → centavos. Texto inválido → null.
export function lerDinheiro(texto) {
  const bruto = String(texto ?? '').replace(/R\$|\s/g, '');
  if (!bruto) return null;
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(bruto)) return null;
  const [inteiro, dec = ''] = bruto.replace(/\./g, '').split(',');
  return Number(inteiro) * 100 + Number(dec.padEnd(2, '0'));
}

// Devolve { campo: mensagem }. Objeto vazio = pode enviar.
export function validarPedido(form, linhas) {
  const erros = {};
  if (!linhas.length) erros.sacola = 'Adicione pelo menos um item.';
  if (linhas.length > LIMITES.linhas) erros.sacola = `No máximo ${LIMITES.linhas} itens por pedido.`;
  if (!MODOS[form.modo]) erros.modo = 'Escolha como quer receber.';
  if (!limpar(form.nome)) erros.nome = 'Informe seu nome para chamarmos no balcão.';
  if (form.modo === 'mesa') {
    const mesa = Number(form.mesa);
    if (!Number.isInteger(mesa) || mesa < 1 || mesa > LOJA.mesas) erros.mesa = `Escolha uma mesa de 1 a ${LOJA.mesas}.`;
  }
  if (form.modo === 'entrega') {
    if (!limpar(form.endereco)) erros.endereco = 'Informe o endereço com número.';
    if (taxaEntrega('entrega', form.regiao) === null) erros.regiao = 'Escolha a região da entrega.';
  }
  if (!PAGAMENTOS[form.pagamento]) erros.pagamento = 'Escolha como vai pagar.';
  if (form.pagamento === 'dinheiro' && String(form.troco ?? '').trim()) {
    const troco = lerDinheiro(form.troco);
    const { totalCentavos } = totais(linhas, form.modo, form.regiao);
    if (troco === null) erros.troco = 'Use um valor como 100 ou 100,00.';
    else if (troco < totalCentavos) erros.troco = 'O troco precisa ser maior que o total.';
  }
  return erros;
}

export const podeIrPara = (atual, novo) => (PROXIMO[atual] || []).includes(novo);
