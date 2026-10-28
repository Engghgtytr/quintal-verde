# Quintal Verde: planejamento

Restaurante **vegano e fictício**, feito como exemplo para mostrar a restaurantes naturais e veganos (muitos são self-service). Seguiu os prompts 01 (arquitetura), 02 (Arena War), 03 (engenharia de animações), 06 (segurança), 07 (anti-vibe) e 08 (lei).

## 1. Arquitetura (prompt 01)

- **Tipo:** site de negócio + catálogo digital com pedido, em **PWA leve** (uma página com rotas por `#`).
- **Formato técnico:** dinâmico. Nesta versão os dados ficam no **modo demonstração** (no próprio navegador, com `localStorage` e `BroadcastChannel` para as abas conversarem). A camada `services/loja.js` é a única que guarda dados, para trocar depois por Supabase com RLS sem mexer nas telas.
- **Alternativas consideradas:**

| Formato | Vantagem | Desvantagem |
|---|---|---|
| ✅ Catálogo + pedido no balcão (este) | Mostra o fluxo real do self-service, roda sem servidor | Na demonstração, cliente e balcão precisam estar no mesmo navegador |
| Só catálogo com WhatsApp | Simples | Não mostra o QR da mesa nem a tela do balcão, que é o pacote de R$ 1.500 |
| App com Supabase já ligado | Funciona entre aparelhos | Precisa de conta e chaves do cliente; fica para quando alguém fechar |

### Mapa de rotas

```text
#/              Início → capa · selo 100% vegetal · quadro do buffet de hoje · como funciona o self-service ·
                da cozinha (à la carte) · nossa feira · onde estamos · rodapé
#/cardapio      Buffet do dia · Da cozinha · Sucos · Sobremesas, com filtros (sem glúten, sem castanhas, sem soja, orgânico)
#/mesa/7        O mesmo cardápio, aberto pelo QR da mesa 7: o pedido já vai como "comer aqui, mesa 7"
#/pedido/:id    Acompanhar o pedido (senha, status ao vivo)
#/painel        Balcão: pedidos (recebido → preparando → pronto → entregue) · buffet de hoje · esgotar itens · QR das mesas
#/privacidade   O que o site guarda
```

### Prioridades

- **Obrigatório:** buffet do dia com ingredientes e alergênicos, cardápio com filtros, adicionais e "tirar ingrediente", sacola com 3 jeitos (comer aqui, retirar, entrega), senha e acompanhamento, tela do balcão, esgotar item, QR das mesas.
- **Se der tempo:** som no balcão quando chega pedido.
- **Não fazer agora:** pagamento online (é loja fictícia: paga no balcão ou na entrega), login de verdade, cálculo de frete por mapa (taxa fixa por bairro).

### Riscos

- Pedido de mesa sem servidor: resolvido com o modo demonstração e explicado na tela.
- Fotos de banco de imagens: são ilustrativas e o site diz isso.

## 2. Arena War (prompt 02): Equipe Campeã

| Momento | Duelo | Vencedora |
|---|---|---|
| Entrada | Capa com foto revelando (clip-path) vs fade simples | **Revelar a foto da capa**, 700 ms, uma vez: é a animação marcante |
| Rolagem | Scroll reveal em tudo vs só no quadro do buffet | **Só os pratos do quadro entram em cascata** (40 ms entre eles), uma vez |
| Clique | Botão afunda vs nenhuma | **Afunda** (scale 0.97, 120 ms) |
| Gaveta da sacola e do prato | Sobe da base vs aparece no centro | **Sobe da base** (280 ms entra, 180 ms sai) |
| Filtros do cardápio | Itens animando ao filtrar vs nenhuma | **Nenhuma**: é usado toda hora, tem que ser instantâneo |
| Pedido mudou de status | Destaque de cor vs nenhuma | **Destaque de cor** (fundo pisca suave 600 ms) |

Com "reduzir movimento": a capa e a gaveta viram fade, a cascata aparece pronta, o destaque de cor continua (cor não é movimento).

## 3. Engenharia (prompt 03)

- Tokens: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, durações 120/180/280/700 ms.
- Só `transform`, `opacity` e `clip-path`. Hover só dentro de `@media (hover: hover)`.

## 4. Visual (prompt 07)

- **Cores do quintal:** folha `#2F6B3F`, mata `#1D2B21`, beterraba `#9B2C4C` (destaque), abóbora `#D9962B` (detalhe), fundo de folha clara `#F2F4EC`.
- **Fonte:** Bricolage Grotesque (hospedada no site), uma família só.
- O memorável: o **quadro do buffet de hoje**, com a data, o preço do quilo e cada prato com seus alergênicos.
- Inspiração (não cópia): Banana Verde. Melhorei o que lá é fraco: o cardápio fica no próprio site, com filtros e alergênicos.
