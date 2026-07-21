# Etapa 01 — Modelagem de Usuários + Autenticação JWT + Seed do Admin

> **Leitura obrigatória antes de executar qualquer ação:** `agents/CLAUDE.md` (raiz do
> projeto). Este documento assume que você já leu e entendeu o escopo, as regras de
> negócio (RN01–RN23) e o estado atual do projeto descritos lá. Se houver qualquer
> conflito entre este arquivo e o `CLAUDE.md`, pare e avise o usuário antes de prosseguir.

## Status do backend antes desta etapa (confirmado em código)

- `AppModule` já configura `ConfigModule` (global) e `MongooseModule.forRootAsync`
  lendo `MONGODB_URI` via `ConfigService`, com logs de conexão/erro.
- `HealthModule` existe em `src/health/` e expõe `GET /health`.
- **Não existe nenhuma entidade de negócio, schema, autenticação ou módulo de usuário
  ainda.** `AppController`/`AppService` ainda são o boilerplate padrão do `nest new`
  ("Hello World") — podem ser removidos nesta etapa se não tiverem uso.

## Objetivo desta etapa

Implementar a base de usuários e autenticação: schema único de `User` (discriminado por
`role`), autenticação via JWT, guards de rota, e o seed do primeiro Admin. Ao final desta
etapa, deve ser possível: criar um Admin via seed, cadastrar um Student, fazer login com
ambos os perfis, e proteger rotas por autenticação e por `role`.

## Escopo funcional (baseado nas RNs do CLAUDE.md)

- **RN01** — Endpoint de cadastro de Student deve validar que o e-mail termina em
  `@gsuite.iff.edu.br` (valor vindo de `ALLOWED_EMAIL_DOMAIN` no `.env`, não hardcoded).
- **RN02** — Fluxo de verificação de e-mail deve existir no código, mas **respeitar a
  flag `EMAIL_VERIFICATION_ENABLED`** do `.env`:
  - Se `false` (estado atual): ao se cadastrar, o Student já nasce com
    `isEmailVerified: true` e pode logar imediatamente.
  - Se `true` (estado futuro, quando o provedor de e-mail for definido): Student nasce
    com `isEmailVerified: false`, recebe token de verificação por e-mail, e login é
    bloqueado até confirmar.
  - **Implemente a lógica para os dois casos agora**, controlada por essa flag, mesmo
    que o envio de e-mail real (Nodemailer) fique como stub/mock por enquanto (ver
    seção "Fora do escopo desta etapa").
- **RN03** — Não deve existir endpoint público de cadastro de Admin. O Admin só é criado
  via script de seed, lendo `ADMIN_SEED_EMAIL` e `ADMIN_SEED_PASSWORD` do `.env`.
- **RN04** — Rotas protegidas devem usar um `JwtAuthGuard` (Passport JWT Strategy).
- **RN05** — Deve existir endpoint (protegido, só Admin) para desativar (`isActive: false`)
  um Student por `id`.
- **RN10** — Student deve ter CRUD do próprio perfil (`name`, `email` não deve ser
  editável — decisão a confirmar com o usuário se e-mail poderá mudar; assuma que **não**
  por padrão, pois é o identificador institucional, e sinalize essa suposição ao usuário
  ao final da tarefa).

## Modelo de dados a implementar

Collection única `User`, campo discriminador `role: 'admin' | 'student'`.

```typescript
// user.schema.ts (estrutura de referência, adapte à convenção do Mongoose/Nest)
{
  name: string;
  email: string;          // unique, lowercase, trim
  passwordHash: string;
  role: 'admin' | 'student';
  isActive: boolean;       // default true
  isEmailVerified: boolean; // default depende de EMAIL_VERIFICATION_ENABLED
  course?: ObjectId;       // ref 'Course' — obrigatório se role === 'student'
  period?: number;         // obrigatório se role === 'student'
  createdAt, updatedAt;    // timestamps automáticos
}
```

> **Atenção:** `Course` ainda não existe como schema (é a Etapa 02). Use o tipo
> `Types.ObjectId` para a referência agora, mas **não crie validação de existência do
> curso nesta etapa** — isso será reforçado quando `CourseModule` existir. Documente essa
> limitação temporária em um comentário no código.

## Endpoints esperados

| Método | Rota | Quem acessa | Descrição |
|---|---|---|---|
| POST | `/auth/register` | Público | Cadastro de Student (valida domínio institucional) |
| POST | `/auth/login` | Público | Login (Admin ou Student), retorna JWT |
| GET | `/auth/verify-email/:token` | Público | Confirma e-mail (só relevante se flag ativa) |
| GET | `/users/me` | Autenticado | Retorna perfil do usuário logado |
| PATCH | `/users/me` | Autenticado | Atualiza próprio perfil |
| GET | `/users/students` | Admin | Lista todos os Students (com filtros básicos de status/curso) |
| PATCH | `/users/students/:id/deactivate` | Admin | Desativa um Student (RN05) |
| PATCH | `/users/students/:id/activate` | Admin | Reativa um Student |

## Requisitos técnicos obrigatórios

1. Senhas sempre com hash via `bcrypt` (nunca armazenar em texto puro).
2. JWT assinado com `JWT_SECRET`/`JWT_EXPIRES_IN` do `.env`, payload mínimo:
   `{ sub: userId, role }`.
3. `JwtStrategy` (Passport) validando o token e anexando o usuário autenticado ao
   `request`.
4. Um `RolesGuard` (ou decorator `@Roles('admin')` + guard) para proteger rotas
   exclusivas de Admin — não confundir autenticação (RN04) com autorização por papel.
5. DTOs de entrada com `class-validator`/`class-transformer` (instale se ainda não
   estiver no projeto) para validar `email`, `password` (tamanho mínimo), `name`, etc.
6. Nunca retornar `passwordHash` em nenhuma resposta da API (usar `class-transformer`
   `@Exclude()` ou serialização manual).
7. Script de seed do Admin: pode ser um comando via `ts-node` (ex:
   `npm run seed:admin`) que verifica se já existe um Admin com `ADMIN_SEED_EMAIL` e,
   se não existir, cria um usando `ADMIN_SEED_PASSWORD` (com hash).

## Fora do escopo desta etapa

- Envio real de e-mail via Nodemailer/Resend (fica como função stub que loga no console
  "e-mail de verificação seria enviado para X" — a integração real de provedor é
  pendência registrada no `CLAUDE.md`, seção 8).
- Módulo de `Course` (Etapa 02) e `Job` (Etapa 03).
- Qualquer tela de frontend (Etapas 04+).
- Recuperação de senha ("esqueci minha senha") — pendência em aberto, não implementar
  ainda a menos que o usuário peça explicitamente.

## Critérios de aceite (o que testar ao final)

- [ ] `npm run seed:admin` cria o Admin (ou informa que já existe, sem duplicar).
- [ ] `POST /auth/register` com e-mail fora de `@gsuite.iff.edu.br` retorna erro 400.
- [ ] `POST /auth/register` com e-mail válido cria o Student com sucesso.
- [ ] `POST /auth/login` retorna um JWT válido para Admin e para Student.
- [ ] `GET /users/me` sem token retorna 401.
- [ ] `GET /users/me` com token válido retorna os dados do usuário logado (sem
      `passwordHash`).
- [ ] `GET /users/students` com token de Student retorna 403 (rota exclusiva de Admin).
- [ ] `PATCH /users/students/:id/deactivate` desativa o Student e ele não consegue mais
      logar depois disso.

## Ao finalizar

Atualize o checklist da seção 7 do `agents/CLAUDE.md`, marcando os itens de schema de
User, módulo de autenticação e seed do Admin como concluídos. Informe ao usuário quais
arquivos foram criados/alterados e quais comandos rodar para testar.
