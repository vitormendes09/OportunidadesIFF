# Etapa 05 — Painel do Admin (Frontend)

> **Leitura obrigatória antes de qualquer ação:** `agents/CLAUDE.md`,
> `agents/design-system.md` e `agents/04-frontend-fundacao.md` (auth, cliente HTTP,
> tema Tailwind+MUI e proteção de rotas devem estar prontos). Consome os endpoints de
> Course e Job já confirmados no código real do backend.

## Objetivo desta etapa

Construir as telas exclusivas do Admin usando **componentes MUI** para a parte de
dados/formulários (tabelas, dialogs, inputs) e **Tailwind** para o layout/estrutura da
página, seguindo o tema único definido na Etapa 04.

## Escopo funcional (RN06–RN09 do CLAUDE.md)

### 1. Gestão de Vagas (`/admin/jobs`)
- Tabela (MUI `Table` ou `DataGrid` se instalado) listando `GET /jobs/admin` — colunas
  sugeridas: título, empresa, tipo de contrato, modelo, status (`Chip` MUI:
  verde=ativa, cinza=inativa), data de publicação, ações.
- Botão "Nova vaga" abre um formulário (página dedicada `/admin/jobs/new` ou `Dialog`
  MUI — decida pela complexidade do formulário; como são muitos campos, uma página
  dedicada tende a ser mais usável que um modal).
- Formulário cobre **todos** os campos de `JobResponseDto`/`CreateJobDto`: título,
  empresa, descrição (`TextField multiline`), `contractType` (`Select` com os 4
  valores do enum), `workModel` (`Select` com os 3 valores), local da empresa, local
  de trabalho, `hasBenefits` (`Switch`) + `benefitsDescription` condicional (só
  aparece/habilita se `hasBenefits` estiver ligado), salário (opcional), URL do
  processo seletivo (`TextField` com validação de URL), `courses` (`Autocomplete
  multiple` do MUI, populado via `GET /courses`), período exigido (opcional, numérico),
  especialidades (`Autocomplete` com `freeSolo` para permitir tags livres).
- Edição reaproveita o mesmo formulário, pré-preenchido via `GET /jobs/:id`.
- Ação de ativar/desativar vaga com `Dialog` de confirmação MUI antes de executar
  (nunca excluir fisicamente — é sempre `DELETE /jobs/:id`, que no backend é soft
  delete, ou o endpoint de reativação equivalente se existir; **confirme no código do
  backend se há rota de reativação de Job** — se não houver, sinalize essa lacuna ao
  usuário em vez de assumir um endpoint que não existe).

### 2. Gestão de Cursos (`/admin/courses`)
- Tabela simples: nome, status, ações.
- Criar/editar via `Dialog` MUI simples (só tem o campo `name`, não precisa de página
  dedicada).
- Ativar/desativar com confirmação.

### 3. Gestão de Alunos (`/admin/students`)
- Tabela consumindo `GET /users/students`: nome, e-mail, curso, período, status.
- Contagem total visível no topo da página (RN07) — texto simples, ex: "42 alunos
  cadastrados", calculado a partir do array retornado (ou de um total vindo da API,
  se existir paginação — confirmar no código atual, que hoje não pagina).
- Filtro por status (ativo/inativo) client-side ou via query, conforme o que
  `ListStudentsQueryDto` do backend já suportar — **verifique os campos aceitos nesse
  DTO antes de montar os filtros da UI**, não invente parâmetros que a API não aceita.
- Ação de desativar/reativar com `Dialog` de confirmação MUI (é revogação de acesso,
  não pode ser um clique único sem aviso).

## Requisitos técnicos obrigatórios

1. Todas as páginas desta etapa vivem sob `/admin/**`, protegidas pelo guard de role
   da Etapa 04.
2. Toda ação destrutiva/de revogação usa `Dialog` de confirmação do MUI, nunca
   `window.confirm` nativo (quebra a consistência visual).
3. Formulário de vaga replica no client as mesmas validações condicionais do backend
   (`benefitsDescription` obrigatório se `hasBenefits`), como feedback imediato — sem
   substituir a validação do backend.
4. Reaproveitar os tipos TypeScript da Etapa 04 (`src/types/`), sem duplicar
   interfaces.
5. Usar `Snackbar`/`Alert` do MUI para feedback de sucesso/erro em toda operação de
   escrita.
6. Componentes de tabela e formulário devem ser responsivos o suficiente para uso em
   notebook/desktop (não é prioridade mobile-first para o painel Admin, mas não deve
   quebrar completamente em telas menores).

## Fora do escopo desta etapa

- Qualquer tela do Student (Etapa 06).
- Painel de estatísticas (pendência em aberto).
- Auditoria/histórico de ações do Admin (pendência em aberto).
- Badge de "vaga em destaque" (`isFeatured`) — não existe no schema atual
  (`agents/design-system.md`, item 5).

## Critérios de aceite

- [ ] Admin cria uma vaga completa pelo formulário e ela aparece corretamente na
      tabela administrativa.
- [ ] Admin edita uma vaga existente e as alterações refletem imediatamente.
- [ ] Admin desativa/reativa uma vaga, com confirmação antes da ação.
- [ ] Admin cria, edita e desativa um curso.
- [ ] Admin visualiza a lista de alunos com contagem total e consegue desativar um
      aluno específico, com confirmação antes da ação.
- [ ] Um usuário Student não consegue acessar nenhuma dessas rotas (redirecionado
      pela guard da Etapa 04).

## Ao finalizar

Atualize a seção 7 do `agents/CLAUDE.md` marcando as telas de painel Admin como
concluídas. Se encontrar alguma lacuna de endpoint (ex: reativação de vaga não existe
no backend), registre isso explicitamente na seção 8 (Pendências) em vez de contornar
com uma solução improvisada no frontend.
