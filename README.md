# Oportunidades IFF

Sistema web para centralizar e organizar as vagas de emprego e estágio divulgadas pela **Agência Oportunidades IFF** (atualmente divulgadas via Instagram), restrito a alunos e servidores do **Instituto Federal Fluminense (IFF)**.

O sistema substitui o fluxo manual do Instagram por uma plataforma própria, onde a Agência cadastra as vagas recebidas das empresas parceiras e os alunos filtram e visualizam apenas as oportunidades relevantes para seu curso, sem sair do sistema até o momento de serem redirecionados para o processo seletivo oficial da empresa.

---

## Índice

- [Visão Geral](#visão-geral)
- [Regras de Negócio (RN)](#regras-de-negócio-rn)
- [Entidades e Relacionamentos](#entidades-e-relacionamentos)
- [Fluxos Principais](#fluxos-principais)
- [Arquitetura e Stack](#arquitetura-e-stack)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Autenticação](#autenticação)
- [Como Rodar o Projeto](#como-rodar-o-projeto)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Roadmap / Próximos Passos](#roadmap--próximos-passos)

---

## Visão Geral

O sistema possui dois perfis de usuário:

| Perfil | Descrição |
|---|---|
| **Admin** | Representa a Agência Oportunidades IFF. Cadastra, edita e remove vagas. Gerencia a lista de cursos. Gerencia alunos (visualiza, ativa/desativa). |
| **Aluno** | Aluno ou servidor do IFF com e-mail institucional válido. Cria seu perfil, filtra vagas por curso/período/especialidade e visualiza detalhes, sendo redirecionado ao processo seletivo da empresa quando desejar. |

Não há inscrição de aluno dentro do sistema — o Oportunidades IFF é uma **vitrine de vagas com redirecionamento**, não um portal de recrutamento.

---

## Regras de Negócio (RN)

### Acesso e Autenticação

- **RN01** — Somente e-mails do domínio `@gsuite.iff.edu.br` podem se cadastrar como Aluno.
- **RN02** — Após o cadastro, o Aluno recebe um e-mail de verificação (link/código) e só pode fazer login após confirmar o e-mail.
- **RN03** — Não há cadastro público de Admin. O primeiro Admin é criado via *seed* (script de inicialização do banco) no primeiro deploy.
- **RN04** — Toda a área de vagas (listagem, filtros, detalhes) é protegida — só é acessível com sessão autenticada (JWT válido).
- **RN05** — Um Admin pode desativar (soft delete) qualquer Aluno a qualquer momento. Aluno desativado não consegue mais logar.

### Usuário Admin

- **RN06** — Admin possui CRUD do próprio perfil (dados de acesso).
- **RN07** — Admin pode visualizar a lista completa de Alunos cadastrados, incluindo quantidade total e status (ativo/inativo).
- **RN08** — Admin cadastra, edita e remove vagas.
- **RN09** — Admin gerencia a lista fixa de **Cursos** do IFF (cadastro, edição, remoção), que é usada tanto no cadastro do Aluno quanto na criação da vaga.

### Usuário Aluno

- **RN10** — Aluno possui CRUD do próprio perfil: nome, e-mail institucional, senha, curso e período.
- **RN11** — Aluno pode filtrar vagas por curso, período exigido e especialidades.
- **RN12** — Aluno pode visualizar o detalhe completo de qualquer vaga ativa.
- **RN13** — Aluno pode compartilhar uma vaga (link direto para a página de detalhe da vaga) via qualquer canal (WhatsApp, Instagram, etc.), utilizando a API nativa de compartilhamento do navegador/dispositivo.
- **RN14** — Aluno **não** se candidata dentro do sistema. Ao acessar o link da vaga, é redirecionado para a página externa do processo seletivo da empresa.

### Vagas

- **RN15** — Vagas são exibidas em ordem de **pilha (LIFO)** — a vaga publicada mais recentemente aparece primeiro na listagem.
- **RN16** — Toda vaga possui data de publicação (`publishedAt`), preenchida automaticamente na criação.
- **RN17** — Toda vaga possui um dos seguintes tipos de contrato: `CLT`, `PJ`, `Estágio`, `Outro`.
- **RN18** — Toda vaga possui um dos seguintes modelos de trabalho: `Presencial`, `Híbrido`, `Remoto`.
- **RN19** — Toda vaga possui local da empresa (endereço/cidade da empresa) e local de trabalho (onde a atividade será exercida, podendo ser diferente do local da empresa).
- **RN20** — Toda vaga indica se possui benefícios ou não; se possuir, o Admin descreve quais.
- **RN21** — Toda vaga possui um link de redirecionamento para a página oficial do processo seletivo, fornecido pela empresa parceira.
- **RN22** — Vagas ficam visíveis indefinidamente até serem removidas ou inativadas manualmente pelo Admin (sem expiração automática).
- **RN23** — Toda vaga é vinculada a um ou mais Cursos cadastrados pelo Admin, além de período exigido e especialidades (tags livres).

---

## Entidades e Relacionamentos

### `User` (base) → discriminado em `Admin` e `Student`

Para simplificar o modelo, existe uma coleção única de usuários com um campo `role` (`admin` | `student`), diferenciando os dados e permissões de cada perfil.

**Campos comuns:**
- `_id`
- `name`
- `email` (único, deve pertencer ao domínio `@gsuite.iff.edu.br` para `student`)
- `passwordHash`
- `role`: `admin` | `student`
- `isActive` (boolean, default `true`)
- `isEmailVerified` (boolean, default `false` — usado apenas para `student`)
- `createdAt`, `updatedAt`

**Campos exclusivos do `Student`:**
- `course` (referência a `Course`)
- `period` (número/período atual do aluno, ex: `5`)

> Admins não possuem curso/período — são apenas gestores da Agência.

---

### `Course` (Curso)

Lista fixa e gerenciável pelo Admin, usada tanto no cadastro do Aluno quanto na criação de vagas.

- `_id`
- `name` (ex: "Análise e Desenvolvimento de Sistemas")
- `isActive`
- `createdAt`, `updatedAt`

**Relacionamento:** `1 Course → N Student` | `N Course ↔ N Job`

---

### `Job` (Vaga)

Entidade central do sistema, cadastrada exclusivamente pelo Admin.

- `_id`
- `title` — título da vaga
- `companyName` — nome da empresa parceira
- `description` — descrição geral da vaga/atividades
- `contractType`: `CLT` | `PJ` | `Estágio` | `Outro`
- `workModel`: `Presencial` | `Híbrido` | `Remoto`
- `companyLocation` — cidade/endereço da empresa
- `workLocation` — local onde a atividade é exercida
- `hasBenefits` (boolean)
- `benefitsDescription` (opcional, preenchido se `hasBenefits = true`)
- `salary` (opcional — o Admin pode optar por não divulgar)
- `applicationUrl` — link de redirecionamento para o processo seletivo da empresa
- `courses` — array de referências a `Course` (uma vaga pode servir a mais de um curso)
- `requiredPeriod` — período mínimo exigido (opcional)
- `specialties` — array de tags livres (ex: `["Excel", "Inglês intermediário"]`)
- `isActive` (boolean — usado para remoção lógica pelo Admin)
- `publishedAt` (data de publicação, usada para ordenação LIFO)
- `createdBy` — referência ao `Admin` responsável pelo cadastro
- `createdAt`, `updatedAt`

**Relacionamento:** `1 Admin → N Job` | `N Job ↔ N Course`

---

### Diagrama de Relacionamento (resumo)

```
Admin (User) 1 ───── N Job
Course        1 ───── N Student
Course        N ───── N Job
```

---

## Fluxos Principais

### Cadastro e Verificação do Aluno
1. Aluno acessa a tela de cadastro e informa nome, e-mail institucional, senha, curso e período.
2. Backend valida o domínio `@gsuite.iff.edu.br`.
3. Sistema envia e-mail de verificação com link/código.
4. Aluno confirma o e-mail → conta é ativada para login.

### Login
1. Usuário informa e-mail e senha.
2. Backend valida credenciais, status (`isActive`) e, no caso de aluno, `isEmailVerified`.
3. Backend retorna um JWT contendo `id`, `role` e tempo de expiração.
4. Frontend armazena o token e o utiliza em todas as requisições autenticadas.

### Cadastro de Vaga (Admin)
1. Admin preenche o formulário completo da vaga (todos os campos de `Job`).
2. Vaga é salva com `publishedAt` automático e `isActive = true`.
3. Vaga passa a aparecer no topo da listagem (ordem LIFO) para os Alunos dos cursos vinculados.

### Consulta de Vagas (Aluno)
1. Aluno acessa a listagem (ordenada por `publishedAt` decrescente).
2. Aplica filtros: curso, período exigido, especialidades.
3. Acessa o detalhe da vaga.
4. Pode compartilhar o link da vaga ou clicar em "Ir para o processo seletivo", sendo redirecionado à `applicationUrl`.

### Gestão de Alunos (Admin)
1. Admin acessa o painel de alunos.
2. Visualiza quantidade total, filtra por status/curso.
3. Pode desativar (`isActive = false`) qualquer aluno, revogando seu acesso.

---

## Arquitetura e Stack

Projeto **monorepo** com TypeScript de ponta a ponta.

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (React + TypeScript) |
| Backend | NestJS (Node.js + TypeScript) |
| Banco de Dados | MongoDB Atlas (via Mongoose) |
| Autenticação | JWT (Access Token) |
| Envio de E-mail | Nodemailer + provedor SMTP transacional (sugestão: **Resend** ou **Gmail SMTP** em ambiente de desenvolvimento — simples de configurar e gratuito para baixo volume) |

> **Sobre o envio de e-mail:** para começar de forma simples e gratuita, recomenda-se usar **Nodemailer com SMTP do Resend** (fácil configuração, camada gratuita generosa, boa entregabilidade). Em produção, pode-se migrar para um domínio de e-mail próprio do IFF, se disponibilizado pela instituição.

---

## Estrutura de Pastas

```
oportunidades-iff/
├── README.md
├── agents/          # Documentação de contexto, prompts e instruções para IAs/agentes
├── frontend/        # Aplicação Next.js
└── backend/         # Aplicação NestJS
```

Cada subpasta (`frontend/` e `backend/`) terá seu próprio `package.json`, rodando de forma independente, mas compartilhando o mesmo repositório e contexto documentado em `agents/`.

---

## Autenticação

- Autenticação via **JWT (JSON Web Token)**.
- Login gera um `access_token` assinado pelo backend (NestJS + `@nestjs/jwt`).
- Token carrega `sub` (id do usuário) e `role` (`admin` | `student`).
- Rotas do backend protegidas por `Guards` que validam o token e, quando necessário, o `role` (ex: rotas de criação de vaga só acessíveis por `admin`).
- Frontend guarda o token (via cookie httpOnly, recomendado por segurança) e o envia no header `Authorization: Bearer <token>` em toda requisição autenticada.

---

## Como Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- [npm](https://www.npmjs.com/) (já vem com o Node.js)
- Uma conta no [MongoDB Atlas](https://www.mongodb.com/atlas) com uma string de conexão (URI) já criada
- Uma conta em um provedor de e-mail transacional (ex: [Resend](https://resend.com)) para envio de verificação de cadastro

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd oportunidades-iff
```

### 2. Configurar e rodar o Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend/` (veja [Variáveis de Ambiente](#variáveis-de-ambiente)).

```bash
npm run start:dev
```

O backend estará disponível em `http://localhost:3001` (ou porta configurada no `.env`).

### 3. Configurar e rodar o Frontend

Em **outro terminal**:

```bash
cd frontend
npm install
```

Crie um arquivo `.env.local` na pasta `frontend/` (veja [Variáveis de Ambiente](#variáveis-de-ambiente)).

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`.

### 4. Acessar o sistema

- Abra `http://localhost:3000` no navegador.
- Use o e-mail do Admin criado via *seed* para acessar o painel administrativo.
- Cadastre-se com um e-mail `@gsuite.iff.edu.br` para testar o fluxo de Aluno.

> Resumindo: **dois terminais abertos** — um em `backend/` rodando `npm run start:dev`, outro em `frontend/` rodando `npm run dev`.

---

## Variáveis de Ambiente

### `backend/.env`

```env
# Servidor
PORT=3001

# Banco de Dados
MONGODB_URI=sua_connection_string_do_mongodb_atlas

# JWT
JWT_SECRET=uma_chave_secreta_forte
JWT_EXPIRES_IN=1d

# E-mail (Nodemailer)
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USER=resend
MAIL_PASSWORD=sua_api_key_do_resend
MAIL_FROM="Oportunidades IFF <noreply@seudominio.com>"

# Domínio institucional permitido
ALLOWED_EMAIL_DOMAIN=gsuite.iff.edu.br

# Seed do Admin inicial
ADMIN_SEED_EMAIL=admin@seudominio.com
ADMIN_SEED_PASSWORD=senha_forte_temporaria
```

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Importante:** nunca versionar os arquivos `.env` e `.env.local`. Adicione-os ao `.gitignore` de cada pasta.

---

## Roadmap / Próximos Passos

Itens ainda não fechados, sugeridos para as próximas rodadas de definição:

- [ ] Definir se haverá painel de estatísticas para o Admin (ex: vagas mais visualizadas, cursos com mais alunos).
- [ ] Definir política de recuperação de senha (fluxo "esqueci minha senha").
- [ ] Definir paginação/quantidade de vagas exibidas por página na listagem.
- [ ] Definir se haverá notificação (e-mail/push) ao aluno quando uma nova vaga do seu curso for publicada.
- [ ] Definir política de logs/auditoria de ações do Admin (quem cadastrou/removeu qual vaga).
- [ ] Definir design system e identidade visual do frontend.

---

## Licença

Projeto interno do Instituto Federal Fluminense — Agência Oportunidades IFF. Uso restrito à comunidade acadêmica do IFF.
