# Design System — Oportunidades IFF (Frontend)

> **Leitura obrigatória antes de qualquer tarefa de frontend**, junto com
> `agents/CLAUDE.md`. Este documento registra a identidade visual do projeto,
> extraída do mockup de referência enviado pelo dono do produto (arquivo HTML
> "TalentFlow"), adaptada para o domínio do Oportunidades IFF.

## Decisão de stack visual (fechada)

- **Tailwind CSS** — layout, espaçamento, grid, responsividade, utilitários gerais.
- **Material UI (MUI)** — componentes complexos e com estado: tabelas/listagens
  administrativas, formulários, modais/dialogs de confirmação, selects/multi-selects,
  date pickers, snackbars/toasts de feedback.
- **Ícones:** Material Symbols (mesma família usada no mockup), via `@mui/icons-material`
  ou fonte `Material Symbols Outlined` carregada globalmente — manter consistência,
  não misturar com outras bibliotecas de ícone (ex: lucide, heroicons) no mesmo projeto.
- **Fonte:** Manrope (Google Fonts), pesos 400/600/700/800, igual ao mockup.

**Como conciliar as duas bibliotecas sem conflito de estilo:** o tema do MUI
(`createTheme`) deve ser configurado com os mesmos tokens de cor/tipografia/raio de
borda do Tailwind (ver seção abaixo), para que um componente MUI e um componente
estilizado via Tailwind pareçam parte do mesmo sistema visual. Um único arquivo
(`src/theme/tokens.ts`) deve ser a fonte única desses valores, consumido tanto pelo
`tailwind.config.ts` quanto pelo `ThemeProvider` do MUI — nunca duplicar os valores
hardcoded em dois lugares.

## Tokens extraídos do mockup

### Cores (light mode)

| Token | Valor | Uso sugerido |
|---|---|---|
| `primary` | `#004ba4` | Cor de marca principal, botões primários, links ativos |
| `primary-container` | `#0062d2` | Estados hover/destaque de primary |
| `on-primary` | `#ffffff` | Texto sobre `primary` |
| `on-primary-container` | `#dce5ff` | Texto sobre `primary-container` |
| `secondary` | `#585f66` | Textos secundários, elementos neutros |
| `secondary-container` | `#dce3eb` | Fundos neutros (chips inativos, badges neutros) |
| `tertiary` | `#a10219` | Uso pontual — no mockup era usado para "vaga em destaque" |
| `tertiary-container` | `#c4262e` | Variante de tertiary |
| `error` | `#ba1a1a` | Estados de erro, validação, badges de alerta |
| `error-container` | `#ffdad6` | Fundo suave de erro |
| `background` | `#f8f9ff` | Fundo geral da aplicação |
| `surface` | `#f8f9ff` | Superfícies base |
| `surface-container-lowest` | `#ffffff` | Cards, header, elementos "elevados" |
| `surface-container-low` | `#eff4ff` | Fundos alternados |
| `surface-container` | `#e5eeff` | Chips inativos, fundos de seção |
| `surface-container-high` | `#dce9ff` | Estados hover de superfícies |
| `on-surface` | `#0b1c30` | Texto principal |
| `on-surface-variant` | `#424753` | Texto secundário/legendas |
| `outline` | `#727785` | Bordas de inputs, ícones neutros |
| `outline-variant` | `#c2c6d6` | Bordas suaves, divisores |

> Este é um tema **light**. O mockup referenciava classes `dark:` esparsas, mas não
> definia uma paleta dark completa. **Dark mode não faz parte do escopo fechado do
> projeto** — não implemente tema escuro a menos que solicitado explicitamente.

### Tipografia (Manrope)

| Token | Tamanho / Line-height / Peso | Uso |
|---|---|---|
| `display-lg` | 48px / 56px / 800, letter-spacing -0.02em | Uso raro, hero de landing (não se aplica ao painel interno) |
| `headline-lg` | 32px / 40px / 700, letter-spacing -0.01em | Títulos de página (ex: "Vagas disponíveis") |
| `headline-lg-mobile` | 24px / 32px / 700 | Mesma função em telas pequenas |
| `title-md` | 18px / 24px / 600 | Títulos de card, nome de vaga, navegação ativa |
| `body-md` | 16px / 24px / 400 | Texto corrido, descrições |
| `label-sm` | 12px / 16px / 600, letter-spacing 0.05em | Badges, tags, legendas pequenas |

### Espaçamento e forma

| Token | Valor |
|---|---|
| `spacing.base` | 4px |
| `spacing.xs` | 8px |
| `spacing.sm` | 16px |
| `spacing.md` | 24px (também usado como `gutter`) |
| `spacing.lg` | 32px |
| `spacing.xl` | 48px |
| `container-max` | 1200px (largura máxima do conteúdo, centralizado) |
| `borderRadius.DEFAULT` | 0.25rem |
| `borderRadius.lg` | 0.5rem |
| `borderRadius.xl` | 0.75rem |
| `borderRadius.full` | 9999px (badges, avatar, chips) |

## Adaptações obrigatórias em relação ao mockup original

O mockup enviado é um job board genérico ("TalentFlow") e **não reflete o escopo real
do Oportunidades IFF**. Ao reutilizar sua identidade visual, as seguintes mudanças são
obrigatórias:

1. **Nome/marca:** trocar "TalentFlow" por "Oportunidades IFF" no header/footer.
2. **Chips de filtro por categoria genérica** (Tecnologia, Design, Marketing...) devem
   virar filtros reais do domínio: **curso** (multi-select vindo de `GET /courses`),
   **período exigido** e **especialidades** — não são categorias fixas de mercado.
3. **Sino de notificações** no header: não existe nenhuma funcionalidade de notificação
   no escopo fechado (é uma pendência em aberto no `CLAUDE.md`). **Não implementar** o
   ícone/badge de notificação a menos que solicitado.
4. **Salário sempre exibido nos cards:** no nosso domínio, `salary` é campo opcional
   (`Job.salary?`). O card deve tratar a ausência de salário graciosamente (ex: ocultar
   a linha ou exibir "A combinar"), nunca quebrar layout.
5. **Badge "Destaque"/"Novo":** não existe conceito de vaga em destaque no schema atual
   (`Job` não tem campo `isFeatured`). Não implementar esse selo a menos que o usuário
   peça — se quiser, isso seria uma nova etapa de contexto (`08-...md`), não algo
   assumido aqui.
6. **Botão "Ver detalhes"** deve levar à página de detalhe da vaga (rota interna do
   Oportunidades IFF), nunca diretamente ao `applicationUrl` — esse redirecionamento
   externo só acontece dentro da página de detalhe (RN14).
7. **Card não pode ter ação de candidatura** — no mockup era implícito que clicar no
   card levava a um fluxo de aplicação. Aqui, o card leva ao detalhe; o redirecionamento
   externo é uma ação explícita e separada dentro do detalhe.
8. **Foto de perfil do usuário no header:** o schema de `User` não tem campo de avatar/
   foto. Usar um avatar com iniciais do nome (comum em MUI: `<Avatar>{initials}</Avatar>`)
   em vez de depender de uma URL de imagem que não existe no backend.
9. **Botão "Carregar mais vagas":** paginação é uma pendência em aberto no `CLAUDE.md`
   (seção 8). Enquanto não houver paginação real no backend, **não implemente** esse
   botão — exiba todas as vagas retornadas pelo `GET /jobs` de uma vez.

## Onde este design system se aplica

- **Etapa 06 (painel do Aluno)** é a que mais se aproxima visualmente do mockup enviado
  (é literalmente a tela de listagem/detalhe de vagas).
- **Etapa 05 (painel do Admin)** usa os mesmos tokens de cor/tipografia, mas sua
  composição de tela é diferente (tabelas de gestão, formulários) — o mockup não cobre
  essa tela, então o agente deve manter consistência de tema sem ter uma referência
  visual 1:1 para copiar.
