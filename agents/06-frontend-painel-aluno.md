# Etapa 06 — Painel do Aluno / Student (Frontend)

> **Leitura obrigatória antes de qualquer ação:** `agents/CLAUDE.md`,
> `agents/design-system.md` e `agents/04-frontend-fundacao.md`. Esta etapa é a que mais
> se aproxima visualmente do mockup de referência enviado pelo dono do produto — use-o
> como base de layout, **aplicando as adaptações obrigatórias listadas em
> `agents/design-system.md`** (seção "Adaptações obrigatórias").

## Objetivo desta etapa

Construir a experiência do Student: listagem/filtro de vagas (inspirada no mockup
"TalentFlow" adaptado ao domínio), detalhe de vaga com redirecionamento e
compartilhamento, e edição do próprio perfil.

## Escopo funcional (RN10–RN14 do CLAUDE.md)

### 1. Listagem de Vagas (`/vagas` ou `/` — página principal pós-login do Student)

Estrutura de referência (adaptada do mockup enviado):
- Header com nome do usuário (Avatar com iniciais) e navegação — já vem da Etapa 04,
  não recriar.
- Barra de busca por texto livre **apenas se o backend suportar** — confira
  `ListJobsQueryDto` no código do backend antes de adicionar um campo de busca; hoje
  ele aceita `course`, `requiredPeriod` e `specialty`, não um campo de texto livre
  genérico. Se quiser um campo de busca por título/empresa, isso exigiria alterar o
  backend primeiro (fora do escopo desta etapa — sinalize ao usuário se for desejado).
- Filtros reais do domínio, substituindo os chips genéricos do mockup: `Autocomplete`
  MUI multi-select para curso (`GET /courses`), `Select`/`TextField` numérico para
  período exigido, `Autocomplete freeSolo` para especialidade.
- Grid de cards (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, via Tailwind, igual ao
  mockup), um card por vaga, consumindo `GET /jobs` **na ordem exata retornada pela
  API** (já vem ordenado LIFO por `publishedAt` — não reordenar no client).
- Cada card exibe: título, empresa, `workModel` (ícone `location_on` + texto),
  `contractType` (ícone `description` + texto), salário **se existir**
  (`job.salary ?? 'A combinar'`), e botão "Ver detalhes" levando à rota de detalhe
  interna (`/vagas/[id]`) — nunca ao `applicationUrl` diretamente a partir do card.
- Sem botão de "Carregar mais" (paginação é pendência em aberto — exibir tudo que
  `GET /jobs` retornar).
- Estado vazio tratado: se o array retornado for vazio (ou vazio após aplicar
  filtros), exibir uma mensagem clara em vez de grid em branco.

### 2. Detalhe da Vaga (`/vagas/[id]`)

- Consome `GET /jobs/:id`, exibindo todos os campos: descrição completa, benefícios
  (se `hasBenefits`), salário (se informado), locais (empresa e trabalho),
  especialidades (`Chip` MUI para cada tag), cursos vinculados (nomes, não IDs).
- **Botão "Ir para o processo seletivo"** (`Button` MUI, `variant="contained"`) —
  abre `applicationUrl` em nova aba (`target="_blank"` + `rel="noopener noreferrer"`).
  Este é o único lugar do sistema onde esse redirecionamento acontece (RN14).
- **Botão de compartilhar** — usar `navigator.share()` quando disponível (título +
  URL da página de detalhe), com fallback de copiar link para a área de transferência
  (`navigator.clipboard.writeText`) + `Snackbar` MUI confirmando "Link copiado".

### 3. Perfil do Aluno (`/perfil`)

- Formulário MUI para editar `name`, `course` (`Autocomplete`, vindo de
  `GET /courses`) e `period`, consumindo `PATCH /users/me`.
- `email` exibido como somente leitura (`TextField disabled`) — não editável, é o
  identificador institucional (decisão da Etapa 01).

## Requisitos técnicos obrigatórios

1. Todas as páginas exigem sessão autenticada (guard da Etapa 04); não é exclusivo de
   Student — Admin também pode navegar aqui se quiser, não é necessário bloquear.
2. Debounce (~300-500ms) em qualquer filtro que dispare requisição automaticamente.
3. Verificar `navigator.share` antes de usar (`if (navigator.share) {...} else {...}`)
   — sempre com fallback funcional, nunca deixar o botão sem ação em navegadores sem
   suporte.
4. Reaproveitar tipos TypeScript de `Job`/`Course` da Etapa 04.
5. Seguir os tokens de `agents/design-system.md` (cores, tipografia Manrope, radius) —
   a tela deve parecer visualmente parte do mesmo produto que o mockup de referência,
   mas com a terminologia e os campos corretos do Oportunidades IFF.

## Fora do escopo desta etapa

- Qualquer candidatura dentro do sistema (RN14 — reforçado).
- Notificação de novas vagas por curso (pendência em aberto).
- Badge de "vaga em destaque"/"nova" — não existe campo correspondente no schema
  atual (`agents/design-system.md`, item 5). Se quiser um selo "Nova" calculado no
  client (ex: `publishedAt` dentro das últimas 48h), isso é uma decisão de produto —
  pergunte ao usuário antes de implementar, não assuma.
- Qualquer tela exclusiva de Admin (Etapa 05).

## Critérios de aceite

- [ ] Student vê a listagem de vagas na mesma ordem retornada pela API (mais recente
      primeiro).
- [ ] Filtros por curso/período/especialidade funcionam de forma combinada,
      respeitando exatamente os parâmetros aceitos por `ListJobsQueryDto`.
- [ ] Card sem `salary` não quebra o layout (exibe fallback "A combinar" ou similar).
- [ ] Detalhe da vaga exibe todos os campos corretamente, incluindo nomes dos cursos
      vinculados (não IDs crus).
- [ ] Botão de redirecionamento abre `applicationUrl` em nova aba.
- [ ] Botão de compartilhar funciona via Web Share API ou fallback de copiar link.
- [ ] Student edita nome/curso/período do próprio perfil com sucesso; e-mail
      permanece não editável.
- [ ] Vaga desativada pelo Admin não aparece mais nesta listagem.

## Ao finalizar

Atualize a seção 7 do `agents/CLAUDE.md` marcando as telas do painel Student como
concluídas. Neste ponto, o sistema cobre o fluxo funcional completo do `README.md`.