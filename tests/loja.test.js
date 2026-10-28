// A "loja" do modo demonstração, com um localStorage de mentira.
import { beforeEach, describe, expect, it } from 'vitest';

const dados = new Map();
globalThis.localStorage = {
  getItem: (k) => (dados.has(k) ? dados.get(k) : null),
  setItem: (k, v) => dados.set(k, String(v)),
  removeItem: (k) => dados.delete(k),
};

const loja = await import('../src/services/loja.js');

const form = { modo: 'retirada', nome: 'Ana', pagamento: 'pix' };

describe('loja (demonstração)', () => {
  beforeEach(async () => {
    dados.clear();
    await loja.zerarDemonstracao();
  });

  it('cria pedido com preço recalculado e senha do dia', async () => {
    const p = await loja.criarPedido(form, [{ itemId: 'limonada', qtd: 2, precoCentavos: 1 }], new Date(2026, 9, 28, 12));
    expect(p.totalCentavos).toBe(2000);
    expect(p.senha).toBe(1);
    expect(p.status).toBe('recebido');
    const p2 = await loja.criarPedido(form, [{ itemId: 'limonada', qtd: 1 }], new Date(2026, 9, 28, 13));
    expect(p2.senha).toBe(2);
    const amanha = await loja.criarPedido(form, [{ itemId: 'limonada', qtd: 1 }], new Date(2026, 9, 29, 12));
    expect(amanha.senha).toBe(1); // senha recomeça a cada dia
  });

  it('recusa item esgotado e campos inválidos', async () => {
    await loja.alternarEsgotado('limonada');
    await expect(loja.criarPedido(form, [{ itemId: 'limonada', qtd: 1 }])).rejects.toThrow(/acabou/);
    await expect(loja.criarPedido({ ...form, nome: '' }, [{ itemId: 'suco-verde', qtd: 1 }])).rejects.toMatchObject({ campos: { nome: expect.any(String) } });
  });

  it('status só anda para frente e o pedido de mesa guarda a mesa', async () => {
    const p = await loja.criarPedido({ ...form, modo: 'mesa', mesa: '4' }, [{ itemId: 'suco-verde', qtd: 1 }]);
    expect(p.mesa).toBe(4);
    await loja.mudarStatus(p.id, 'preparando');
    await loja.mudarStatus(p.id, 'pronto');
    await expect(loja.mudarStatus(p.id, 'recebido')).rejects.toThrow();
    expect((await loja.pedido(p.id)).historico.map((h) => h.status)).toEqual(['recebido', 'preparando', 'pronto']);
  });

  it('buffet do dia só aceita itens do buffet', async () => {
    await loja.definirBuffet(['curry', 'limonada', 'nao-existe']);
    expect((await loja.estado()).buffetHoje).toEqual(['curry']);
  });
});
