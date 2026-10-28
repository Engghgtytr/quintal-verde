import { describe, expect, it } from 'vitest';
import { ITENS } from '../src/data/cardapio.js';
import {
  alergenicosDaLinha, filtrar, lerDinheiro, linhaOficial, podeIrPara, totais, validarPedido, item,
} from '../src/utils/regras.js';

describe('cardápio', () => {
  it('todo item tem ingredientes, seção e alergênicos conhecidos', () => {
    const conhecidos = ['gluten', 'castanhas', 'amendoim', 'soja', 'gergelim'];
    for (const i of ITENS) {
      expect(i.ingredientes.length).toBeGreaterThan(0);
      expect(['buffet', 'cozinha', 'sucos', 'sobremesas']).toContain(i.secao);
      for (const a of i.contem) expect(conhecidos).toContain(a);
      if (i.secao !== 'buffet') expect(i.precoCentavos).toBeGreaterThan(0);
    }
  });

  it('nenhum ingrediente de origem animal (é 100% vegetal)', () => {
    // (?<![\p{L}]) e (?![\p{L}]): palavra inteira também com acento ("melão" não é "mel")
    const proibidos = /(?<!\p{L})(carne|frango|peixe|bacon(?! de coco)|leite(?! de coco)|queijo(?! de castanha)|manteiga|ovos?|mel|gelatina|creme de leite)(?!\p{L})/iu;
    for (const i of ITENS) {
      for (const ing of i.ingredientes) expect(ing).not.toMatch(proibidos);
      for (const a of i.adicionais || []) expect(a.nome).not.toMatch(proibidos);
    }
  });
});

describe('filtros', () => {
  it('sem glúten tira o kibe e os burgers; sem castanhas tira farofa e torta', () => {
    const semGluten = filtrar(ITENS, ['sem_gluten']).map((i) => i.id);
    expect(semGluten).not.toContain('kibe-abobora');
    expect(semGluten).not.toContain('burger-feijao');
    expect(semGluten).toContain('curry');
    const semCastanhas = filtrar(ITENS, ['sem_castanhas']).map((i) => i.id);
    expect(semCastanhas).not.toContain('farofa-banana');
    expect(semCastanhas).not.toContain('rolinho'); // amendoim conta junto com castanhas
  });

  it('filtros se somam', () => {
    const r = filtrar(ITENS, ['sem_gluten', 'organico']);
    expect(r.every((i) => !i.contem.includes('gluten') && i.tags.includes('organico'))).toBe(true);
  });
});

describe('linha da sacola', () => {
  it('recalcula o preço pelo cardápio, ignorando o que veio do navegador', () => {
    const l = linhaOficial({ itemId: 'burger-feijao', qtd: 2, adicionais: ['bacon-coco', 'inventado'], removidos: ['tomate', 'pão'], precoCentavos: 1 });
    expect(l.unitarioCentavos).toBe(3400 + 500);
    expect(l.subtotalCentavos).toBe(7800);
    expect(l.adicionais.map((a) => a.id)).toEqual(['bacon-coco']);
    expect(l.removidos).toEqual(['tomate']); // "pão" não está na lista de removíveis
  });

  it('adicional com castanha soma o alergênico', () => {
    expect(alergenicosDaLinha(item('burger-feijao'), ['queijo-castanha'])).toEqual(['gluten', 'castanhas']);
  });

  it('recusa buffet, item esgotado, quantidade estranha e item que não existe', () => {
    expect(linhaOficial({ itemId: 'curry', qtd: 1 })).toBeNull();
    expect(linhaOficial({ itemId: 'limonada', qtd: 1 }, ['limonada'])).toBeNull();
    expect(linhaOficial({ itemId: 'limonada', qtd: 0 })).toBeNull();
    expect(linhaOficial({ itemId: 'limonada', qtd: 999 })).toBeNull();
    expect(linhaOficial({ itemId: 'nada', qtd: 1 })).toBeNull();
  });

  it('observação vira uma linha só e é cortada', () => {
    const l = linhaOficial({ itemId: 'limonada', qtd: 1, obs: 'sem gelo\n\n<b>por favor</b>' + 'x'.repeat(300) });
    expect(l.obs).not.toContain('\n');
    expect(l.obs.length).toBe(140);
  });
});

describe('pedido', () => {
  const linhas = [linhaOficial({ itemId: 'bowl-quinoa', qtd: 1 })];
  const base = { modo: 'retirada', nome: 'Ana', pagamento: 'pix' };

  it('totais com taxa só na entrega', () => {
    expect(totais(linhas, 'retirada').totalCentavos).toBe(3600);
    expect(totais(linhas, 'entrega', 'medio').totalCentavos).toBe(3600 + 900);
  });

  it('valida cada modo', () => {
    expect(validarPedido(base, linhas)).toEqual({});
    expect(validarPedido({ ...base, nome: '  ' }, linhas)).toHaveProperty('nome');
    expect(validarPedido({ ...base, modo: 'mesa', mesa: 13 }, linhas)).toHaveProperty('mesa');
    expect(validarPedido({ ...base, modo: 'mesa', mesa: '7' }, linhas)).toEqual({});
    const e = validarPedido({ ...base, modo: 'entrega' }, linhas);
    expect(e).toHaveProperty('endereco');
    expect(e).toHaveProperty('regiao');
    expect(validarPedido(base, [])).toHaveProperty('sacola');
  });

  it('troco', () => {
    expect(lerDinheiro('R$ 1.000,50')).toBe(100050);
    expect(lerDinheiro('abc')).toBeNull();
    expect(validarPedido({ ...base, pagamento: 'dinheiro', troco: '20' }, linhas)).toHaveProperty('troco');
    expect(validarPedido({ ...base, pagamento: 'dinheiro', troco: '50' }, linhas)).toEqual({});
  });

  it('status só anda para frente', () => {
    expect(podeIrPara('recebido', 'preparando')).toBe(true);
    expect(podeIrPara('pronto', 'recebido')).toBe(false);
    expect(podeIrPara('entregue', 'cancelado')).toBe(false);
  });
});
