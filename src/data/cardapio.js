// Cardápio do Quintal Verde (restaurante FICTÍCIO). Tudo é 100% vegetal.
// Preços em centavos. `contem` lista os alergênicos; `tags` as qualidades (orgânico).
// As fotos são ilustrativas (Unsplash), não são pratos de um restaurante de verdade.

export const LOJA = {
  nome: 'Quintal Verde',
  endereco: 'Rua das Hortas, 120 · Vila Madalena · São Paulo',
  enderecoFicticio: true,
  // [abre, fecha] por dia da semana: 0 = domingo
  horarios: { 0: ['11:30', '16:00'], 1: null, 2: ['11:30', '21:30'], 3: ['11:30', '21:30'], 4: ['11:30', '21:30'], 5: ['11:30', '22:00'], 6: ['11:30', '22:00'] },
  precoQuiloCentavos: 7990,
  mesas: 12,
  // Entrega: taxa fixa por região (sem mapa nem API paga)
  entrega: [
    { id: 'perto', nome: 'Vila Madalena e Pinheiros', taxaCentavos: 600 },
    { id: 'medio', nome: 'Perdizes, Sumaré e Alto de Pinheiros', taxaCentavos: 900 },
    { id: 'longe', nome: 'Outros bairros da zona oeste', taxaCentavos: 1400 },
  ],
};

export const ALERGENICOS = {
  gluten: 'glúten',
  castanhas: 'castanhas',
  amendoim: 'amendoim',
  soja: 'soja',
  gergelim: 'gergelim',
};

export const FILTROS = [
  { id: 'sem_gluten', nome: 'Sem glúten', passa: (i) => !i.contem.includes('gluten') },
  { id: 'sem_castanhas', nome: 'Sem castanhas', passa: (i) => !i.contem.includes('castanhas') && !i.contem.includes('amendoim') },
  { id: 'sem_soja', nome: 'Sem soja', passa: (i) => !i.contem.includes('soja') },
  { id: 'organico', nome: 'Orgânico', passa: (i) => i.tags.includes('organico') },
];

export const SECOES = [
  { id: 'buffet', nome: 'Buffet de hoje', descricao: 'Monte o prato e pese no balcão. O buffet muda todo dia.' },
  { id: 'cozinha', nome: 'Da cozinha', descricao: 'Feito na hora. Peça pelo QR da mesa ou no balcão.' },
  { id: 'sucos', nome: 'Sucos', descricao: 'Batidos na hora, sem açúcar refinado.' },
  { id: 'sobremesas', nome: 'Sobremesas', descricao: 'Sem leite, sem ovo, sem mel.' },
];

const ad = (id, nome, precoCentavos, contem = []) => ({ id, nome, precoCentavos, contem });

export const ITENS = [
  // ---------- Buffet (preço por quilo) ----------
  { id: 'arroz-curcuma', secao: 'buffet', nome: 'Arroz integral com cúrcuma', descricao: 'Arroz integral soltinho com cúrcuma e cebolinha.', ingredientes: ['arroz integral', 'cúrcuma', 'cebola', 'cebolinha', 'azeite'], contem: [], tags: ['organico'] },
  { id: 'feijao-abobora', secao: 'buffet', nome: 'Feijão preto com abóbora', descricao: 'Feijão cozido devagar com cubos de abóbora cabotiá.', ingredientes: ['feijão preto', 'abóbora cabotiá', 'alho', 'louro'], contem: [], tags: ['organico'] },
  { id: 'curry', secao: 'buffet', nome: 'Curry de legumes com leite de coco', descricao: 'Batata-doce, couve-flor e grão-de-bico no curry suave.', ingredientes: ['batata-doce', 'couve-flor', 'grão-de-bico', 'leite de coco', 'curry', 'gengibre'], contem: [], tags: [], foto: 'curry' },
  { id: 'creme-abobora', secao: 'buffet', nome: 'Creme de abóbora com gengibre', descricao: 'Creme liso, finalizado com sementes de abóbora.', ingredientes: ['abóbora', 'gengibre', 'cebola', 'sementes de abóbora'], contem: [], tags: ['organico'], foto: 'creme-abobora' },
  { id: 'salada-tofu', secao: 'buffet', nome: 'Salada de folhas com tofu defumado', descricao: 'Folhas da semana, rabanete, melão e tofu defumado em cubos.', ingredientes: ['alface', 'rúcula', 'rabanete', 'melão', 'tofu defumado', 'molho de limão'], contem: ['soja'], tags: [], foto: 'salada-tofu' },
  { id: 'salada-figo', secao: 'buffet', nome: 'Salada de quinoa, figo e beterraba', descricao: 'Quinoa colorida, figo fresco, beterraba assada e romã.', ingredientes: ['quinoa', 'figo', 'beterraba', 'romã', 'hortelã'], contem: [], tags: [], foto: 'salada-figo' },
  { id: 'rolinho', secao: 'buffet', nome: 'Rolinhos de papel de arroz', descricao: 'Legumes crus enrolados, com molho de amendoim à parte.', ingredientes: ['papel de arroz', 'cenoura', 'repolho roxo', 'pepino', 'manjericão', 'molho de amendoim'], contem: ['amendoim', 'soja'], tags: [], foto: 'rolinho' },
  { id: 'legumes-brasa', secao: 'buffet', nome: 'Legumes na brasa', descricao: 'Abobrinha, berinjela e pimentão grelhados com ervas.', ingredientes: ['abobrinha', 'berinjela', 'pimentão', 'alecrim', 'azeite'], contem: [], tags: ['organico'] },
  { id: 'farofa-banana', secao: 'buffet', nome: 'Farofa de banana-da-terra', descricao: 'Farinha de mandioca torrada com banana e castanha-do-pará.', ingredientes: ['farinha de mandioca', 'banana-da-terra', 'castanha-do-pará', 'cebola'], contem: ['castanhas'], tags: [] },
  { id: 'kibe-abobora', secao: 'buffet', nome: 'Kibe de abóbora assado', descricao: 'Trigo para kibe com abóbora e hortelã, assado no forno.', ingredientes: ['trigo para kibe', 'abóbora', 'hortelã', 'cebola'], contem: ['gluten'], tags: [] },

  // ---------- Da cozinha ----------
  {
    id: 'burger-feijao', secao: 'cozinha', nome: 'Burger de feijão-preto e quinoa', precoCentavos: 3400, foto: 'burger-feijao',
    descricao: 'Pão de fermentação natural, burger de feijão e quinoa, maionese de aquafaba e folhas.',
    ingredientes: ['pão de fermentação natural', 'feijão preto', 'quinoa', 'maionese de aquafaba', 'alface', 'tomate', 'cebola roxa'],
    contem: ['gluten'], tags: [],
    adicionais: [ad('queijo-castanha', 'Queijo de castanha de caju', 600, ['castanhas']), ad('bacon-coco', 'Bacon de coco', 500), ad('batata', 'Batata rústica', 900)],
    removiveis: ['tomate', 'cebola roxa', 'maionese de aquafaba'],
  },
  {
    id: 'burger-cogumelo', secao: 'cozinha', nome: 'Burger de cogumelos com fritas', precoCentavos: 3900, foto: 'burger-cogumelo',
    descricao: 'Burger de shiitake e shimeji, picles da casa e fritas de mandioca.',
    ingredientes: ['pão de fermentação natural', 'shiitake', 'shimeji', 'picles de pepino', 'mostarda', 'mandioca frita'],
    contem: ['gluten', 'soja'], tags: [],
    adicionais: [ad('queijo-castanha', 'Queijo de castanha de caju', 600, ['castanhas']), ad('cogumelo-extra', 'Cogumelos extras', 700)],
    removiveis: ['picles de pepino', 'mostarda'],
  },
  {
    id: 'bowl-quinoa', secao: 'cozinha', nome: 'Bowl do quintal', precoCentavos: 3600, foto: 'bowl-quinoa',
    descricao: 'Quinoa, abacate, legumes assados, folhas e tahine de limão.',
    ingredientes: ['quinoa', 'abacate', 'berinjela assada', 'folhas', 'tahine', 'limão'],
    contem: ['gergelim'], tags: ['organico'],
    adicionais: [ad('tofu', 'Tofu grelhado', 600, ['soja']), ad('castanhas', 'Mix de castanhas', 500, ['castanhas'])],
    removiveis: ['abacate', 'tahine'],
  },
  {
    id: 'bowl-grao', secao: 'cozinha', nome: 'Bowl de grão-de-bico crocante', precoCentavos: 3200, foto: 'bowl-grao',
    descricao: 'Grão-de-bico assado com páprica, cuscuz marroquino, abacate e ervilha-torta.',
    ingredientes: ['grão-de-bico', 'páprica', 'cuscuz marroquino', 'abacate', 'ervilha-torta', 'pistache'],
    contem: ['gluten', 'castanhas'], tags: [],
    adicionais: [ad('abacate-extra', 'Abacate extra', 400)],
    removiveis: ['pistache', 'abacate'],
  },

  // ---------- Sucos ----------
  { id: 'suco-verde', secao: 'sucos', nome: 'Suco verde', precoCentavos: 1400, foto: 'suco-verde', descricao: 'Couve, maçã, limão e gengibre.', ingredientes: ['couve', 'maçã', 'limão', 'gengibre'], contem: [], tags: ['organico'], adicionais: [ad('gengibre', 'Gengibre extra', 0)], removiveis: ['gengibre'] },
  { id: 'suco-frutas', secao: 'sucos', nome: 'Suco de laranja, cenoura e acerola', precoCentavos: 1500, foto: 'suco-frutas', descricao: 'Batido na hora, sem coar.', ingredientes: ['laranja', 'cenoura', 'acerola'], contem: [], tags: [], removiveis: ['acerola'] },
  { id: 'limonada', secao: 'sucos', nome: 'Limonada de hortelã', precoCentavos: 1000, foto: 'limonada', descricao: 'Limão, hortelã e um toque de açúcar demerara.', ingredientes: ['limão', 'hortelã', 'açúcar demerara', 'água'], contem: [], tags: [], removiveis: ['açúcar demerara'] },

  // ---------- Sobremesas ----------
  { id: 'torta-cacau', secao: 'sobremesas', nome: 'Torta de cacau e castanha', precoCentavos: 1600, foto: 'torta-cacau', descricao: 'Recheio cremoso de cacau sobre base de castanhas e tâmaras.', ingredientes: ['cacau', 'castanha de caju', 'tâmara', 'óleo de coco', 'coco ralado'], contem: ['castanhas'], tags: [] },
  { id: 'bolo-chocolate', secao: 'sobremesas', nome: 'Bolo de chocolate sem ovo', precoCentavos: 1400, foto: 'bolo-chocolate', descricao: 'Massa fofinha com cobertura de chocolate meio amargo vegano.', ingredientes: ['farinha de trigo', 'cacau', 'açúcar mascavo', 'óleo', 'chocolate 70% vegano'], contem: ['gluten'], tags: [] },
  { id: 'torta-frutas', secao: 'sobremesas', nome: 'Torta de frutas vermelhas', precoCentavos: 1700, foto: 'torta-frutas', descricao: 'Creme de cacau com morango e mirtilo por cima.', ingredientes: ['farinha de amêndoas', 'cacau', 'morango', 'mirtilo', 'leite de coco'], contem: ['castanhas'], tags: [] },
];

// O que entra no buffet quando o painel ainda não escolheu o do dia.
export const BUFFET_PADRAO = ['arroz-curcuma', 'feijao-abobora', 'curry', 'creme-abobora', 'salada-tofu', 'salada-figo', 'rolinho', 'farofa-banana'];

// Créditos das fotos (Unsplash). Nenhuma é de um restaurante de verdade.
export const CREDITOS_FOTOS = [
  'IGfIGP5ONV0', 'KPDbRyFOTnE', 'eqMHmoe550Y', 'IWv1iwHJdPM', 'Sya_pQnqx8Y', 'Wzo_34cS5bA', 'kPLccIMtS8E', 'hy8cZtKpHBQ',
  'yhc4pSbl01A', '_pGfJTZi5OE', '6UxD0NzDywI', '1V1HdLlxeq0', 'UtcOhVC-3VU', 'fxJTl_gDh28', '0wn-DdavPa4', 'VU17nC77iJg',
  'vN1YusQcUJ4', 'vm9h4FcvUY4', 'B6gIcZsod2Y', 'kPxsqUGneXQ', 'pgA_cCgE5ZU',
].map((id) => `https://unsplash.com/photos/${id}`);
