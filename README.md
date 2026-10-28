# Quintal Verde

Site de um restaurante **vegano e fictício**, feito como projeto de portfólio da Penchel.Dev e como exemplo para mostrar a restaurantes naturais e self-service.

> O restaurante, o endereço, os preços e os pedidos não existem. As fotos são ilustrativas, do Unsplash.

## O que tem

- **Início:** capa, quadro do **buffet de hoje** (com alergênicos e preço do quilo), como funciona o self-service, pratos da cozinha, feira e onde estamos.
- **Cardápio:** buffet do dia, cozinha, sucos e sobremesas, com filtros (sem glúten, sem castanhas, sem soja, orgânico), ingredientes e alergênicos de cada prato.
- **Pedido:** adicionais, "tirar ingrediente", observação e 3 jeitos de receber: comer aqui (mesa), retirar no balcão ou entrega (taxa por região).
- **QR da mesa** (`#/mesa/7`): o cardápio abre já na mesa certa.
- **Senha e acompanhamento** (`#/pedido/...`): a senha muda sozinha quando o balcão avança o pedido.
- **Painel do balcão** (`#/painel`): pedidos ao vivo (recebido → em preparo → pronto → entregue), buffet de hoje, esgotar itens e QR codes das mesas para imprimir.

## Modo demonstração

Os dados ficam no navegador de quem está vendo (`localStorage`) e as abas conversam entre si. Para ver o pedido chegar: abra o **cardápio da mesa 7** numa aba, o **painel** em outra e faça um pedido. Nada é cobrado e nada vai para servidor.

Para um restaurante de verdade, só o arquivo `src/services/loja.js` muda: as mesmas funções passam a falar com o Supabase (com login no painel e RLS no banco). O preço já é recalculado pelo cardápio em `src/utils/regras.js`, nunca confiando no navegador.

## Rodar

```powershell
npm.cmd install
npm.cmd run dev      # site em http://localhost:5173
npm.cmd test         # 16 testes
npm.cmd run build
```

`npm run imagens` refaz as fotos em WebP a partir de `fotos-originais/`.

## Como foi feito

Seguiu os prompts 01, 02, 03, 06, 07 e 08 (veja `planejamento.md`). Lighthouse no celular: 99 / 100 / 100 / 100.
