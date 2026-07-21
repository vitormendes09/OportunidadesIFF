# CLAUDE.md — Contexto do Projeto Oportunidades IFF

> Este arquivo deve ser lido por qualquer agente de IA **antes de executar qualquer ação**
> no projeto (gerar código, criar arquivos, instalar dependências, alterar schemas, etc).
> Ele resume o escopo, as regras de negócio, o estado atual e as convenções do projeto.
> Se algo pedido pelo usuário conflitar com este documento, o agente deve avisar antes
> de prosseguir, em vez de simplesmente sobrescrever a decisão aqui registrada.

---

## 1. O que é o projeto

**Oportunidades IFF** é um sistema web restrito a alunos e servidores do **Instituto
Federal Fluminense (IFF)** que centraliza vagas de emprego/estágio divulgadas pela
Agência Oportunidades IFF (hoje divulgadas manualmente via Instagram).

O sistema **não é um portal de recrutamento** — não há inscrição dentro da plataforma.
O aluno apenas visualiza vagas filtradas por curso e é **redirecionado** para o processo
seletivo oficial da empresa parceira.

Documento de escopo completo: `README.md` na raiz do repositório. Este arquivo
(`agents/CLAUDE.md`) é um resumo operacional — em caso de dúvida ou divergência, o
`README.md` da raiz é a fonte de verdade.

---

## 2. Perfis de usuário

| Perfil | Pode fazer |
|---|---|
| **Admin** | CRUD do próprio perfil, CRUD de vagas, CRUD da lista de Cursos, visualizar/desativar Alunos |
| **Student (Aluno)** | CRUD do próprio perfil, filtrar vagas, ver detalhes, compartilhar vaga, ser redirecionado ao processo seletivo externo |

Não existe cadastro público de Admin — o primeiro Admin nasce via **seed** no banco.

---

## 3. Regras de negócio (RN) — resumo

- **RN01** — Só e-mails `@gsuite.iff.edu.br` podem se cadastrar como Student.
- **RN02** — Cadastro de Student exige verificação de e-mail (link/código) antes do login.
  ⚠️ **Status atual: DESATIVADO temporariamente** via flag `EMAIL_VERIFICATION_ENABLED=false`
  no `.env` (ver seção 7 — Pendências). O código deve respeitar essa flag, não assumir
  que a verificação está sempre ativa nem remover a lógica.
- **RN03** — Admin é criado via seed, nunca via endpoint público de cadastro.
- **RN04** — Toda rota de vagas (listagem, filtro, detalhe) exige JWT válido.
- **RN05** — Admin pode desativar (`isActive = false`) qualquer Student a qualquer momento.
- **RN06–RN09** — Admin tem CRUD do próprio perfil, visualiza total/lista de Students,
  faz CRUD de vagas e CRUD da lista de Cursos (lista fixa, gerenciável, não texto livre).
- **RN10–RN14** — Student tem CRUD do próprio perfil (nome, e-mail, senha, curso, período),
  filtra vagas por curso/período/especialidade, vê detalhe, compartilha via link nativo,
  **não se candidata dentro do sistema** — só é redirecionado (`applicationUrl`).
- **RN15** — Vagas listadas em ordem **LIFO** (mais recente primeiro), por `publishedAt`.
- **RN16–RN23** — Toda vaga tem: `publishedAt`, `contractType` (CLT/PJ/Estágio/Outro),
  `workModel` (Presencial/Híbrido/Remoto), `companyLocation`, `workLocation`,
  `hasBenefits` (+ descrição opcional), `applicationUrl` (obrigatório), sem expiração
  automática (remoção é sempre manual pelo Admin), vinculada a 1+ `Course`, período
  exigido opcional e `specialties` (tags livres).

---

## 4. Entidades (modelo de dados)

### `User` (coleção única, discriminada por `role`)
Campos comuns: `_id`, `name`, `email` (único), `passwordHash`, `role` (`admin`|`student`),
`isActive`, `isEmailVerified`, `createdAt`, `updatedAt`.
Exclusivo de `student`: `course` (ref `Course`), `period` (number).

### `Course`
`_id`, `name`, `isActive`, `createdAt`, `updatedAt`.
Relação: `1 Course → N Student` | `N Course ↔ N Job`.

### `Job` (Vaga)
`_id`, `title`, `companyName`, `description`, `contractType`, `workModel`,
`companyLocation`, `workLocation`, `hasBenefits`, `benefitsDescription?`, `salary?`,
`applicationUrl`, `courses` (array de refs `Course`), `requiredPeriod?`,
`specialties` (array de strings), `isActive`, `publishedAt`, `createdBy` (ref Admin),
`createdAt`, `updatedAt`.
Relação: `1 Admin → N Job` | `N Job ↔ N Course`.

**Regra de ordenação padrão de qualquer listagem de `Job`:** `sort({ publishedAt: -1 })`.

---

## 5. Stack e decisões técnicas fechadas

| Camada | Tecnologia | Observação |
|---|---|---|
| Frontend | Next.js (App Router, TypeScript, `src/`) + **Tailwind CSS** (layout/utilitários) + **Material UI** (componentes complexos: tabelas, formulários, dialogs) | `frontend/`. Identidade visual e tokens completos em `agents/design-system.md` |
| Backend | NestJS (TypeScript) | `backend/` |
| Banco | MongoDB Atlas via Mongoose | Nome do banco: `oportunidades-iff` |
| Auth | JWT (`@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`) | Token com `sub` (userId) e `role` |
| Hash de senha | `bcrypt` | |
| Config | `@nestjs/config`, `ConfigModule` global lendo `.env` | |
| E-mail | `nodemailer` | Provedor ainda não decidido — ver Pendências |
| Monorepo | Uma raiz com `README.md`, `agents/`, `backend/`, `frontend/` | Sem workspace tool (lerna/turborepo) configurado ainda |
| Gitignore | Único, na raiz (`.gitignore` consolidado) | Não usar `.gitignore` por subpasta |
| Sessão (frontend) | Cookie (não `httpOnly`) via `js-cookie`, nome `oiff_token`, `expires: 1` dia | Escolhido (Etapa 04) em vez de `localStorage` para permitir leitura futura por Server Components/Proxy do Next. Não pode ser `httpOnly` porque quem grava o cookie é o próprio JS do frontend, após receber o token de um backend em outra origem — o Next não emite o `Set-Cookie`. Ver `src/lib/session.ts` |
| Proteção de rota (frontend) | `src/proxy.ts` (Next.js 16 renomeou Middleware → Proxy) decodifica o payload do JWT do cookie **sem validar assinatura** (checagem otimista) | A autorização real continua sempre no backend (`RolesGuard`); o Proxy só evita flash de conteúdo protegido/redireciona cedo |
| CORS (backend) | `app.enableCors({ origin: FRONTEND_URL, credentials: true })` em `main.ts` | **Adicionado na Etapa 04** — não existia antes e bloqueava toda chamada do navegador ao backend. `FRONTEND_URL` novo em `.env`/`.env.example` (default `http://localhost:3000`) |
| `GET /courses` (backend) | Não exige mais JWT (guard movido de nível de classe para os demais endpoints) | **Alterado na Etapa 04** — a tela pública de `/register` precisa listar cursos antes de o Student ter qualquer token. Nome de curso não é dado sensível. `includeInactive` continua só tendo efeito para Admin autenticado |

**Convenções de código a seguir:**
- TypeScript com tipagem explícita em todo lugar (evitar `any`).
- Nest: seguir padrão modular (`*.module.ts`, `*.controller.ts`, `*.service.ts`,
  `*.schema.ts` para Mongoose, `dto/` para DTOs de entrada/saída).
- Toda variável sensível ou configurável vem do `.env` via `ConfigService` — nunca
  hardcode strings de conexão, secrets ou credenciais no código.
- Toda alteração em `.env` deve ser espelhada (sem valores reais) em `.env.example`
  ou `.env.local.example`.
- Rotas administrativas devem ser protegidas por `Guard` de `role: admin`, não apenas
  por autenticação genérica.

---

## 6. Estrutura de pastas (visão atual)

```
OportunidadesIFF/
├── .gitignore
├── LICENSE
├── README.md
├── agents/
│   └── CLAUDE.md          # este arquivo
├── backend/               # NestJS — API, autenticação, banco
│   └── .env               # não versionado
└── frontend/              # Next.js — interface do usuário
    └── .env.local         # não versionado
```

---

## 7. Estado atual do projeto (atualizar conforme avança)

- [x] Escopo e regras de negócio definidos (`README.md`)
- [x] Estrutura de pastas do monorepo criada
- [x] Projeto NestJS gerado em `backend/`
- [x] Projeto Next.js gerado em `frontend/`
- [x] MongoDB Atlas criado (cluster `Cluster0`, banco `oportunidades-iff`)
- [x] `.env` e `.env.example` configurados em `backend/` e `frontend/`
- [x] `ConfigModule` + `MongooseModule` conectados e validados no `app.module.ts`
- [x] Endpoint de health check confirmando conexão com o banco (`GET /health`)
- [x] Schemas do Mongoose (`User`, `Course`, `Job`) criados
- [x] Módulo de autenticação (JWT) implementado
- [x] Seed do Admin inicial implementado
- [x] CRUD de Course
- [x] CRUD de Job (Admin)
- [x] Listagem/filtro de Job (Student)
- [x] CRUD de perfil (Admin e Student)
- [x] Endpoint de desativação de Student (Admin)
- [x] Frontend: fundação (Tailwind + MUI + tema compartilhado + cliente HTTP +
      AuthContext + proteção de rotas) e telas de login/cadastro — Etapa 04
- [x] Frontend: painel Admin (`/admin/jobs`, `/admin/courses`, `/admin/students` —
      CRUD de vaga e curso, gestão de alunos, ativar/desativar com confirmação) — Etapa 05
- [x] Frontend: painel/listagem Student (`/vagas` — grid de cards com filtro por
      curso/período/especialidade; `/vagas/[id]` — detalhe, redirecionamento e
      compartilhar; `/perfil` — edição de nome/curso/período) — Etapa 06

> 🎯 **Marco atingido:** com a Etapa 06, o fluxo funcional completo descrito no
> `README.md` está coberto entre backend e frontend — cadastro/login de Student,
> listagem/filtro/detalhe/compartilhamento de vaga com redirecionamento externo
> (nunca candidatura interna, RN14), edição de perfil, e o painel completo do Admin
> (vagas, cursos, alunos). Itens que faltam são todos pendências já registradas na
> seção 8 (paginação, recuperação de senha, verificação de e-mail, notificações,
> estatísticas, auditoria), não lacunas do fluxo principal.

> ⚠️ Agente: sempre que concluir um item desta lista em uma sessão de trabalho,
> atualize este checklist antes de finalizar a resposta.

---

## 8. Pendências / decisões em aberto

Estas questões **ainda não foram fechadas** com o dono do produto. Não tome decisão
definitiva sobre elas sozinho — implemente de forma que seja fácil ajustar depois,
e sinalize a pendência se o pedido do usuário esbarrar em alguma delas.

- **Verificação de e-mail (RN02):** temporariamente desativada via
  `EMAIL_VERIFICATION_ENABLED=false`. Provedor de envio ainda não escolhido
  (Gmail SMTP foi descartado por exigir 2FA; Resend é o candidato mais provável).
  O código deve ler essa flag do `.env`, não assumir um estado fixo.
- Recuperação de senha ("esqueci minha senha") — fluxo não definido.
- Paginação da listagem de vagas — quantidade por página não definida.
- Notificação ao aluno quando sai vaga nova do seu curso — não definido se existirá.
- Painel de estatísticas para o Admin — não definido.
- Auditoria/logs de ações do Admin (quem criou/removeu qual vaga) — não definido.
- **Reativação de Job:** não existe endpoint dedicado (`/jobs/:id/activate`, no molde
  de `/users/students/:id/activate`). Confirmado na Etapa 05: `UpdateJobDto` aceita
  `isActive` opcional e `JobsService.update()` já aplica esse campo, então o frontend
  reativa via `PATCH /jobs/:id { isActive: true }` (testado e funcional). Se algum dia
  o backend ganhar uma rota dedicada, o frontend (`src/app/(app)/admin/jobs/page.tsx`)
  pode ser simplificado para usá-la, mas não é obrigatório.

---

## 9. Como rodar o projeto localmente

```bash
# Terminal 1 — Backend
cd backend
npm run start:dev     # http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm run dev           # http://localhost:3000
```

Pré-requisito: `backend/.env` e `frontend/.env.local` preenchidos (ver `.env.example`
de cada pasta). Sem a `MONGODB_URI` correta e o IP liberado no Network Access do Atlas,
o backend sobe mas a conexão com o banco falha.

---

## 10. Regra de ouro para o agente

Antes de gerar ou alterar código:
1. Releia a seção 3 (Regras de Negócio) e a seção 4 (Entidades) para não contradizer
   o modelo já definido.
2. Verifique a seção 7 (Estado atual) para saber o que já existe e não recriar do zero
   nem sobrescrever trabalho já feito sem avisar.
3. Verifique a seção 8 (Pendências) antes de tomar decisões de produto por conta própria.
4. Se o pedido do usuário contradizer algo fechado neste documento, avise antes de
   executar — não assuma que o usuário quer mudar uma decisão já tomada.