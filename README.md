# Oportunidades IFF

Sistema web para centralizar e organizar as vagas de emprego e estágio divulgadas pela **Agência Oportunidades IFF** (atualmente divulgadas via Instagram), restrito a alunos e servidores do **Instituto Federal Fluminense (IFF)**.

O sistema substitui o fluxo manual do Instagram por uma plataforma própria, onde a Agência cadastra as vagas recebidas das empresas parceiras e os alunos filtram e visualizam apenas as oportunidades relevantes para seu curso, sem sair do sistema até o momento de serem redirecionados para o processo seletivo oficial da empresa.

---

## Índice

- [Visão Geral](#visão-geral)
- [🚀 Início Rápido com Docker](#-início-rápido-com-docker)
  - [Instalando o Docker](#instalando-o-docker)
  - [Subindo o projeto](#subindo-o-projeto)
  - [Comandos úteis](#comandos-úteis)
  - [Resolvendo problemas](#resolvendo-problemas)
- [Rodando sem Docker](#rodando-sem-docker)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [API — Endpoints](#api--endpoints)
- [Regras de Negócio (RN)](#regras-de-negócio-rn)
- [Entidades e Relacionamentos](#entidades-e-relacionamentos)
- [Fluxos Principais](#fluxos-principais)
- [Arquitetura e Stack](#arquitetura-e-stack)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Autenticação](#autenticação)
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

## 🚀 Início Rápido com Docker

Esta é a forma **recomendada** de rodar o projeto. Com um único comando você sobe os três serviços — banco de dados, backend e frontend — sem instalar Node.js, sem instalar MongoDB e sem criar conta no MongoDB Atlas.

Os comandos abaixo são **idênticos em Windows, macOS e Linux**.

### Instalando o Docker

<details>
<summary><b>🪟 Windows</b></summary>

1. Baixe o **Docker Desktop** em <https://www.docker.com/products/docker-desktop/>.
2. Execute o instalador e mantenha marcada a opção **"Use WSL 2 instead of Hyper-V"**.
3. Reinicie o computador quando solicitado.
4. Abra o **Docker Desktop** e aguarde o ícone da baleia ficar estável (status *Running*).

> **Se aparecer erro de WSL:** abra o PowerShell **como Administrador** e rode `wsl --install`, depois reinicie.

Use o **PowerShell** ou o **Prompt de Comando** para os comandos deste guia.
</details>

<details>
<summary><b>🍎 macOS</b></summary>

**Opção A — Instalador gráfico:**
1. Baixe o **Docker Desktop** em <https://www.docker.com/products/docker-desktop/>.
2. Escolha a versão correta do seu chip: **Apple Silicon** (M1/M2/M3/M4) ou **Intel**.
3. Arraste o Docker para a pasta *Aplicativos* e abra-o.

**Opção B — Homebrew:**
```bash
brew install --cask docker
```

Depois abra o Docker Desktop e aguarde o status *Running*.
</details>

<details>
<summary><b>🐧 Linux (Ubuntu/Debian)</b></summary>

```bash
# Instala o Docker Engine e o plugin do Compose
curl -fsSL https://get.docker.com | sudo sh

# Permite rodar o docker sem sudo
sudo usermod -aG docker $USER
```

**Importante:** faça *logout* e *login* novamente (ou reinicie) para o grupo `docker` valer.

Para Fedora/RHEL, Arch e outras distribuições, veja <https://docs.docker.com/engine/install/>.
</details>

Confirme que a instalação funcionou:

```bash
docker --version
docker compose version
```

> **Nota sobre o comando:** as versões atuais usam `docker compose` (com espaço). Instalações mais antigas usam `docker-compose` (com hífen). Se `docker compose version` falhar, use `docker-compose` no lugar de `docker compose` em todos os comandos deste guia.

### Subindo o projeto

**1. Clone o repositório**

```bash
git clone https://github.com/vitormendes09/OportunidadesIFF.git
cd OportunidadesIFF
```

**2. Crie o arquivo de configuração**

O projeto traz um modelo pronto. Copie-o para `.env`:

```bash
# Linux, macOS, Git Bash ou PowerShell
cp .env.docker.example .env
```

```cmd
:: Windows (Prompt de Comando)
copy .env.docker.example .env
```

O arquivo já vem com valores funcionais para desenvolvimento. **Para uso local você pode subir sem alterar nada.**

> ⚠️ **Antes de expor o sistema para outras pessoas**, troque obrigatoriamente `JWT_SECRET`, `ADMIN_SEED_PASSWORD` e `MONGO_ROOT_PASSWORD`.
> Para gerar uma chave forte: `openssl rand -base64 32` (no Windows, use o Git Bash ou qualquer gerador de senha).

**3. Suba tudo**

```bash
docker compose up -d --build
```

A primeira execução baixa as imagens e compila o projeto — pode levar de **3 a 10 minutos** dependendo da sua internet. As próximas subidas levam poucos segundos.

**4. Crie o admin e os cursos iniciais**

Com os containers rodando, popule o banco:

```bash
docker compose exec backend npm run seed:admin:prod
docker compose exec backend npm run seed:courses:prod
```

O primeiro cria o usuário administrador definido no `.env`; o segundo cadastra os cursos iniciais. **Ambos são idempotentes** — rodar de novo não duplica nada.

**5. Acesse o sistema**

| Serviço | Endereço |
|---|---|
| **Frontend** | <http://localhost:3000> |
| **Backend (API)** | <http://localhost:3001> |
| **Health check** | <http://localhost:3001/health> |
| **MongoDB** | `mongodb://localhost:27017` |

Entre com as credenciais de admin definidas no `.env` (padrão: `admin@gsuite.iff.edu.br` / `admin123`).

Para testar o fluxo de aluno, cadastre-se em <http://localhost:3000/register> usando um e-mail `@gsuite.iff.edu.br`. Como `EMAIL_VERIFICATION_ENABLED=false` por padrão, a conta já nasce ativa e **nenhum servidor de e-mail é necessário**.

### Comandos úteis

```bash
# Ver o status dos containers
docker compose ps

# Acompanhar os logs em tempo real (Ctrl+C para sair)
docker compose logs -f
docker compose logs -f backend     # só o backend

# Parar tudo (os dados do banco são preservados)
docker compose stop

# Parar e remover os containers (dados preservados no volume)
docker compose down

# Remover tudo, INCLUSIVE os dados do banco
docker compose down -v

# Reconstruir após alterar o código
docker compose up -d --build

# Abrir um terminal dentro do container do backend
docker compose exec backend sh
```

> **Ao alterar o código-fonte**, rode `docker compose up -d --build` para reconstruir as imagens. As imagens são de produção (build compilado), então não há *hot reload* — para desenvolvimento com recarregamento automático, veja [Rodando sem Docker](#rodando-sem-docker).

### Resolvendo problemas

<details>
<summary><b>"port is already allocated" / "address already in use"</b></summary>

Alguma porta já está ocupada na sua máquina — geralmente por um MongoDB local ou por um `npm run dev` esquecido aberto.

**Solução:** edite o `.env` e escolha portas livres:

```env
FRONTEND_PORT=3100
BACKEND_PORT=3101
MONGO_PORT=27018

# Estes DOIS precisam acompanhar as portas acima:
NEXT_PUBLIC_API_URL=http://localhost:3101
FRONTEND_URL=http://localhost:3100
```

Depois rode `docker compose up -d --build` (o `--build` é obrigatório aqui, pois a URL da API é embutida no frontend durante o build).
</details>

<details>
<summary><b>O frontend abre, mas nenhum dado carrega / erro de conexão</b></summary>

Quase sempre é `NEXT_PUBLIC_API_URL` incorreta.

Essa variável é **embutida no código que roda no navegador durante o build**, e quem chama a API é o navegador do usuário — não o container. Por isso ela precisa apontar para um endereço acessível a partir da **sua máquina** (`http://localhost:3001`), e **nunca** para o nome interno do serviço (`http://backend:3001`), que só existe dentro da rede do Docker.

Após corrigir o `.env`, reconstrua: `docker compose up -d --build`.
</details>

<details>
<summary><b>"Cannot connect to the Docker daemon"</b></summary>

O Docker não está rodando.

- **Windows/macOS:** abra o Docker Desktop e espere o status *Running*.
- **Linux:** `sudo systemctl start docker`
</details>

<details>
<summary><b>"permission denied" ao rodar docker no Linux</b></summary>

Seu usuário não está no grupo `docker`:

```bash
sudo usermod -aG docker $USER
```

Faça *logout* e *login* novamente para valer.
</details>

<details>
<summary><b>Login falha com "credenciais inválidas"</b></summary>

O seed do admin provavelmente não foi executado. Rode:

```bash
docker compose exec backend npm run seed:admin:prod
```

Se você alterou `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` **depois** de já ter rodado o seed, o admin antigo continua no banco com a senha antiga. Para recomeçar do zero: `docker compose down -v` e suba tudo novamente.
</details>

<details>
<summary><b>Quero usar o MongoDB Atlas em vez do container local</b></summary>

Edite o `docker-compose.yml`, no serviço `backend`, e troque a linha `MONGODB_URI` pela sua connection string do Atlas:

```yaml
MONGODB_URI: mongodb+srv://usuario:senha@cluster.mongodb.net/oportunidades-iff?retryWrites=true&w=majority
```

Remova também o bloco `depends_on` do backend e o serviço `mongo`, se não quiser mais o banco local. Lembre-se de liberar seu IP no *Network Access* do Atlas.
</details>

---

## Rodando sem Docker

Use este modo para **desenvolvimento**, quando quiser *hot reload* a cada alteração no código.

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior (testado com Node 22 e 24)
- npm (já vem com o Node.js)
- Um MongoDB acessível — [Atlas](https://www.mongodb.com/atlas) ou instalação local

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # copy .env.example .env  (Windows CMD)
```

Edite `backend/.env` preenchendo pelo menos `MONGODB_URI` e `JWT_SECRET`. Depois:

```bash
npm run start:dev
```

Backend disponível em <http://localhost:3001>.

Popule o banco (em outro terminal, com o backend configurado):

```bash
npm run seed:admin      # cria o admin a partir do .env
npm run seed:courses    # cria os cursos iniciais
```

### 2. Frontend

Em **outro terminal**:

```bash
cd frontend
npm install
cp .env.local.example .env.local    # copy .env.local.example .env.local  (Windows CMD)
npm run dev
```

Frontend disponível em <http://localhost:3000>.

> Resumindo: **dois terminais** — um em `backend/` com `npm run start:dev`, outro em `frontend/` com `npm run dev`.

---

## Variáveis de Ambiente

### Raiz — `.env` (usado apenas pelo Docker Compose)

Copie de `.env.docker.example`. Controla portas, credenciais do Mongo e as variáveis repassadas aos containers.

| Variável | Padrão | Descrição |
|---|---|---|
| `FRONTEND_PORT` | `3000` | Porta do frontend no host |
| `BACKEND_PORT` | `3001` | Porta da API no host |
| `MONGO_PORT` | `27017` | Porta do MongoDB no host |
| `MONGO_ROOT_USER` / `MONGO_ROOT_PASSWORD` | `root` / `rootpassword` | Credenciais do MongoDB em container |
| `MONGO_DB_NAME` | `oportunidades-iff` | Nome do banco |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | URL da API **vista pelo navegador** (embutida no build) |
| `FRONTEND_URL` | `http://localhost:3000` | Origem liberada no CORS do backend |
| `JWT_SECRET` | — | **Obrigatória.** Chave de assinatura do JWT |
| `JWT_EXPIRES_IN` | `1d` | Validade do token |
| `EMAIL_VERIFICATION_ENABLED` | `false` | Se `false`, contas já nascem verificadas (dispensa SMTP) |
| `ALLOWED_EMAIL_DOMAIN` | `gsuite.iff.edu.br` | Domínio institucional aceito no cadastro |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | `admin@gsuite.iff.edu.br` / `admin123` | Credenciais do admin criado pelo seed |

### `backend/.env` (modo sem Docker)

```env
PORT=3001
FRONTEND_URL=http://localhost:3000

MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/oportunidades-iff

JWT_SECRET=uma_chave_secreta_forte
JWT_EXPIRES_IN=1d

EMAIL_VERIFICATION_ENABLED=false
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=

ALLOWED_EMAIL_DOMAIN=gsuite.iff.edu.br

ADMIN_SEED_EMAIL=admin@gsuite.iff.edu.br
ADMIN_SEED_PASSWORD=senha_forte_temporaria
```

### `frontend/.env.local` (modo sem Docker)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Importante:** os arquivos `.env`, `.env.local` e o `.env` da raiz **não são versionados** — já estão no `.gitignore`. Apenas os `.example` vão para o repositório.

---

## API — Endpoints

Base URL: `http://localhost:3001` (sem prefixo global).

Rotas autenticadas exigem o header `Authorization: Bearer <accessToken>`.

### Autenticação — `/auth`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | Público | Cadastro de aluno (valida o domínio institucional) |
| `POST` | `/auth/login` | Público | Retorna `{ accessToken, user }` |
| `GET` | `/auth/verify-email/:token` | Público | Confirma o e-mail do aluno |

### Usuários — `/users`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/users/me` | Autenticado | Dados do usuário logado |
| `PATCH` | `/users/me` | Autenticado | Atualiza o próprio perfil |
| `GET` | `/users/students` | Admin | Lista alunos (filtros: `status`, `course`) |
| `PATCH` | `/users/students/:id/deactivate` | Admin | Desativa um aluno |
| `PATCH` | `/users/students/:id/activate` | Admin | Reativa um aluno |

### Cursos — `/courses`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/courses` | Público | Lista cursos (usado na tela de cadastro) |
| `GET` | `/courses/:id` | Autenticado | Detalhe de um curso |
| `POST` | `/courses` | Admin | Cria curso |
| `PATCH` | `/courses/:id` | Admin | Edita curso |
| `DELETE` | `/courses/:id` | Admin | Remove curso |

### Vagas — `/jobs`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/jobs` | Autenticado | Lista vagas ativas (filtros: `course`, `requiredPeriod`, `specialty`) |
| `GET` | `/jobs/:id` | Autenticado | Detalhe da vaga |
| `GET` | `/jobs/admin` | Admin | Lista todas as vagas, inclusive inativas |
| `POST` | `/jobs` | Admin | Cria vaga |
| `PATCH` | `/jobs/:id` | Admin | Edita vaga |
| `DELETE` | `/jobs/:id` | Admin | Remove vaga |

### Monitoramento — `/health`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/health` | Público | Retorna `{ status, database }` — usado pelo healthcheck do Docker |

---

## Regras de Negócio (RN)

### Acesso e Autenticação

- **RN01** — Somente e-mails do domínio `@gsuite.iff.edu.br` podem se cadastrar como Aluno (configurável via `ALLOWED_EMAIL_DOMAIN`).
- **RN02** — Após o cadastro, o Aluno recebe um e-mail de verificação e só pode fazer login após confirmá-lo. *Esse fluxo é controlado por `EMAIL_VERIFICATION_ENABLED`; com o valor `false` (padrão em desenvolvimento), a conta já nasce verificada.*
- **RN03** — Não há cadastro público de Admin. O primeiro Admin é criado via *seed* (`npm run seed:admin`).
- **RN04** — Toda a área de vagas (listagem, filtros, detalhes) é protegida — só acessível com JWT válido.
- **RN05** — Um Admin pode desativar (soft delete) qualquer Aluno a qualquer momento. Aluno desativado não consegue mais logar.

### Usuário Admin

- **RN06** — Admin possui CRUD do próprio perfil (dados de acesso).
- **RN07** — Admin pode visualizar a lista completa de Alunos cadastrados, incluindo quantidade total e status (ativo/inativo).
- **RN08** — Admin cadastra, edita e remove vagas.
- **RN09** — Admin gerencia a lista fixa de **Cursos** do IFF, usada tanto no cadastro do Aluno quanto na criação da vaga.

### Usuário Aluno

- **RN10** — Aluno possui CRUD do próprio perfil: nome, e-mail institucional, senha, curso e período.
- **RN11** — Aluno pode filtrar vagas por curso, período exigido e especialidades.
- **RN12** — Aluno pode visualizar o detalhe completo de qualquer vaga ativa.
- **RN13** — Aluno pode compartilhar uma vaga (link direto para a página de detalhe) via qualquer canal, usando a API nativa de compartilhamento do navegador/dispositivo.
- **RN14** — Aluno **não** se candidata dentro do sistema. Ao acessar o link da vaga, é redirecionado para a página externa do processo seletivo da empresa.

### Vagas

- **RN15** — Vagas são exibidas em ordem de **pilha (LIFO)** — a mais recente aparece primeiro.
- **RN16** — Toda vaga possui data de publicação (`publishedAt`), preenchida automaticamente na criação.
- **RN17** — Toda vaga possui um tipo de contrato: `CLT`, `PJ`, `Estágio`, `Outro`.
- **RN18** — Toda vaga possui um modelo de trabalho: `Presencial`, `Híbrido`, `Remoto`.
- **RN19** — Toda vaga possui local da empresa e local de trabalho (podendo ser diferentes).
- **RN20** — Toda vaga indica se possui benefícios; se possuir, o Admin descreve quais.
- **RN21** — Toda vaga possui um link de redirecionamento para o processo seletivo oficial.
- **RN22** — Vagas ficam visíveis indefinidamente até serem removidas ou inativadas manualmente (sem expiração automática).
- **RN23** — Toda vaga é vinculada a um ou mais Cursos, além de período exigido e especialidades (tags livres).

---

## Entidades e Relacionamentos

### `User` (base) → discriminado em `Admin` e `Student`

Coleção única de usuários com um campo `role` (`admin` | `student`) diferenciando dados e permissões.

**Campos comuns:**
- `_id`
- `name`
- `email` (único, deve pertencer ao domínio institucional quando `student`)
- `passwordHash` (nunca retornado nas consultas — `select: false`)
- `role`: `admin` | `student`
- `isActive` (boolean, default `true`)
- `isEmailVerified` (boolean, default `false` — usado apenas para `student`)
- `emailVerificationToken` (`select: false`)
- `createdAt`, `updatedAt`

**Campos exclusivos do `Student`:**
- `course` (referência a `Course`)
- `period` (período atual do aluno, ex: `5`)

> Admins não possuem curso/período — são apenas gestores da Agência.

### `Course` (Curso)

Lista gerenciável pelo Admin, usada no cadastro do Aluno e na criação de vagas.

- `_id`
- `name` (ex: "Sistemas de Informação")
- `isActive`
- `createdAt`, `updatedAt`

**Relacionamento:** `1 Course → N Student` | `N Course ↔ N Job`

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
- `applicationUrl` — link do processo seletivo da empresa
- `courses` — array de referências a `Course`
- `requiredPeriod` — período mínimo exigido (opcional)
- `specialties` — array de tags livres (ex: `["Excel", "Inglês intermediário"]`)
- `isActive` (boolean — remoção lógica pelo Admin)
- `publishedAt` (usada para ordenação LIFO)
- `createdBy` — referência ao `Admin` responsável
- `createdAt`, `updatedAt`

**Relacionamento:** `1 Admin → N Job` | `N Job ↔ N Course`

### Diagrama de Relacionamento (resumo)

```
Admin (User) 1 ───── N Job
Course       1 ───── N Student
Course       N ───── N Job
```

---

## Fluxos Principais

### Cadastro e Verificação do Aluno
1. Aluno acessa a tela de cadastro e informa nome, e-mail institucional, senha, curso e período.
2. Backend valida o domínio institucional.
3. Se `EMAIL_VERIFICATION_ENABLED=true`, envia e-mail de verificação; caso contrário, a conta já nasce ativa.
4. Aluno confirma o e-mail → conta liberada para login.

### Login
1. Usuário informa e-mail e senha.
2. Backend valida credenciais, `isActive` e, no caso de aluno, `isEmailVerified`.
3. Backend retorna `{ accessToken, user }`, com `sub` e `role` no payload do JWT.
4. Frontend armazena o token em cookie e o envia nas requisições autenticadas.

### Cadastro de Vaga (Admin)
1. Admin preenche o formulário completo da vaga.
2. Vaga é salva com `publishedAt` automático e `isActive = true`.
3. Passa a aparecer no topo da listagem (LIFO) para os Alunos dos cursos vinculados.

### Consulta de Vagas (Aluno)
1. Aluno acessa a listagem (ordenada por `publishedAt` decrescente).
2. Aplica filtros: curso, período exigido, especialidades.
3. Acessa o detalhe da vaga.
4. Compartilha o link ou clica em "Ir para o processo seletivo", sendo redirecionado à `applicationUrl`.

### Gestão de Alunos (Admin)
1. Admin acessa o painel de alunos.
2. Visualiza a quantidade total e filtra por status/curso.
3. Pode desativar (`isActive = false`) qualquer aluno, revogando seu acesso.

---

## Arquitetura e Stack

Projeto **monorepo** com TypeScript de ponta a ponta.

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (React 19 + TypeScript), Material UI 9, Tailwind CSS 4, Axios |
| Backend | NestJS 11 (Node.js + TypeScript) |
| Banco de Dados | MongoDB 7 (via Mongoose) — em container no Docker, ou MongoDB Atlas |
| Autenticação | JWT (Access Token) com Passport |
| Envio de E-mail | Nodemailer + SMTP (opcional — desabilitado por padrão) |
| Infraestrutura | Docker + Docker Compose (multi-stage builds) |

> **Sobre o envio de e-mail:** o fluxo de verificação é opcional e vem desligado (`EMAIL_VERIFICATION_ENABLED=false`), permitindo rodar o sistema sem nenhum provedor SMTP. Para ativá-lo em produção, recomenda-se **Nodemailer com SMTP do Resend** (configuração simples e camada gratuita generosa) ou um domínio de e-mail próprio do IFF.

---

## Estrutura de Pastas

```
OportunidadesIFF/
├── README.md
├── docker-compose.yml         # Orquestra mongo + backend + frontend
├── .env.docker.example        # Modelo de configuração do Docker
├── agents/                    # Documentação de contexto para IAs/agentes
├── backend/                   # Aplicação NestJS
│   ├── Dockerfile
│   └── src/
│       ├── auth/              # Login, registro, JWT, guards
│       ├── users/             # Perfis, gestão de alunos
│       ├── courses/           # CRUD de cursos
│       ├── jobs/              # CRUD de vagas
│       ├── mail/              # Envio de e-mail
│       ├── health/            # Healthcheck
│       └── seed/              # Scripts de população do banco
└── frontend/                  # Aplicação Next.js (App Router)
    ├── Dockerfile
    └── src/
        ├── app/               # Rotas e páginas
        ├── components/        # Componentes reutilizáveis
        ├── contexts/          # AuthContext
        ├── hooks/             # Hooks customizados
        ├── lib/               # Cliente da API, sessão
        ├── theme/             # Design system (MUI + tokens)
        └── proxy.ts           # Proteção de rotas (middleware do Next 16)
```

---

## Autenticação

- Autenticação via **JWT (JSON Web Token)**, assinado pelo backend com `@nestjs/jwt`.
- O token carrega `sub` (id do usuário) e `role` (`admin` | `student`).
- Rotas do backend protegidas por `JwtAuthGuard` e, quando necessário, `RolesGuard` (ex.: criação de vaga só por `admin`).
- O frontend guarda o token em cookie e o envia no header `Authorization: Bearer <token>` via interceptor do Axios. Um interceptor de resposta desloga o usuário automaticamente em caso de `401`.
- O arquivo `frontend/src/proxy.ts` faz uma checagem **otimista** da sessão (apenas decodifica o payload, sem validar a assinatura) para redirecionar rotas no cliente. **A autorização real é sempre feita no backend.**

---

## Roadmap / Próximos Passos

- [ ] Definir se haverá painel de estatísticas para o Admin (ex: vagas mais visualizadas, cursos com mais alunos).
- [ ] Definir política de recuperação de senha (fluxo "esqueci minha senha").
- [ ] Definir paginação/quantidade de vagas exibidas por página na listagem.
- [ ] Definir se haverá notificação (e-mail/push) ao aluno quando uma nova vaga do seu curso for publicada.
- [ ] Definir política de logs/auditoria de ações do Admin.
- [ ] Adicionar testes automatizados (unitários e e2e) e integração contínua.

---

## Licença

Projeto interno do Instituto Federal Fluminense — Agência Oportunidades IFF. Uso restrito à comunidade acadêmica do IFF.
