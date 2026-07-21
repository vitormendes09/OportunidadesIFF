# Etapa 04 — Fundação do Frontend (Next.js + Tailwind + MUI)

> **Leitura obrigatória antes de qualquer ação:** `agents/CLAUDE.md` e
> `agents/design-system.md`. Este arquivo substitui a versão anterior de mesmo nome —
> a stack visual foi decidida (Tailwind + MUI) e o contrato da API foi validado contra
> o código real do backend (etapas 01–03 já implementadas e confirmadas).

## Backend confirmado (contrato real, não suposição)

O backend já está implementado e testado. Os tipos abaixo refletem exatamente os DTOs
de resposta do código-fonte — use-os como base literal para os `types` do frontend,
sem reinterpretar nomes de campo.

```typescript
// Enums (espelhar exatamente estes valores/strings)
enum Role { ADMIN = 'admin', STUDENT = 'student' }
enum ContractType { CLT = 'CLT', PJ = 'PJ', ESTAGIO = 'Estágio', OUTRO = 'Outro' }
enum WorkModel { PRESENCIAL = 'Presencial', HIBRIDO = 'Híbrido', REMOTO = 'Remoto' }

interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  course?: string;       // ObjectId do curso, como string
  period?: number;
  createdAt: string;
  updatedAt: string;
}

interface CourseResponseDto {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JobCourseSummary {
  id: string;
  name?: string;
}

interface JobResponseDto {
  id: string;
  title: string;
  companyName: string;
  description: string;
  contractType: ContractType;
  workModel: WorkModel;
  companyLocation: string;
  workLocation: string;
  hasBenefits: boolean;
  benefitsDescription?: string;
  salary?: string;
  applicationUrl: string;
  courses: JobCourseSummary[];   // já vem populado com nome, não só ObjectId
  requiredPeriod?: number;
  specialties: string[];
  isActive: boolean;
  publishedAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

## Endpoints confirmados (usar exatamente estas rotas/métodos)

| Método | Rota | Auth | Observação |
|---|---|---|---|
| POST | `/auth/register` | Público | Body: `{ name, email, password, course, period }` |
| POST | `/auth/login` | Público | Body: `{ email, password }` → retorna token JWT |
| GET | `/auth/verify-email/:token` | Público | Confirma e-mail (fluxo pode estar com verificação desativada — ver `CLAUDE.md` seção 8) |
| GET | `/users/me` | JWT | Retorna `UserResponseDto` do usuário logado |
| PATCH | `/users/me` | JWT | Atualiza nome/curso/período próprio |
| GET | `/users/students` | JWT + Admin | Lista Students |
| PATCH | `/users/students/:id/deactivate` | JWT + Admin | Desativa Student |
| PATCH | `/users/students/:id/activate` | JWT + Admin | Reativa Student |
| GET | `/courses?includeInactive=true` | JWT | Lista cursos (flag só tem efeito para Admin) |
| POST \| PATCH \| DELETE | `/courses` / `/courses/:id` | JWT + Admin | CRUD de curso (`DELETE` é soft delete) |
| GET | `/jobs?course=&requiredPeriod=&specialty=` | JWT | Listagem para Student, já ordenada por `publishedAt` desc, já filtra `isActive: true` |
| GET | `/jobs/admin` | JWT + Admin | Lista todas as vagas, incluindo inativas |
| GET | `/jobs/:id` | JWT | Detalhe de uma vaga |
| POST \| PATCH \| DELETE | `/jobs` / `/jobs/:id` | JWT + Admin | CRUD de vaga (`DELETE` é soft delete) |

**Importante:** antes de codificar o cliente HTTP de login, confirme o formato exato
da resposta de `POST /auth/login` chamando o backend real (curl/Insomnia) — não assuma
o nome do campo do token (`access_token` vs `token`, etc.), leia o `auth.service.ts` do
backend ou teste a chamada real.

## Stack desta etapa (decisão fechada)

- **Next.js** (App Router, já gerado no projeto).
- **Tailwind CSS** — instalar e configurar (`tailwind.config.ts`) com os tokens de
  `agents/design-system.md` (cores, fontFamily, borderRadius, spacing customizados).
- **Material UI (MUI)** — instalar `@mui/material`, `@emotion/react`, `@emotion/styled`
  e `@mui/icons-material`. Configurar `ThemeProvider` com um tema (`createTheme`)
  usando os **mesmos valores** de cor/tipografia do Tailwind — criar
  `src/theme/tokens.ts` como fonte única consumida por ambos.
- **Fonte Manrope** via `next/font/google`.
- Instalar `axios` (recomendado, facilita interceptors para o header de Authorization
  e tratamento de 401 centralizado) — documentar se optar por `fetch` nativo no lugar.

## Escopo desta etapa

1. **Cliente HTTP** (`src/lib/api.ts`) — base URL de `NEXT_PUBLIC_API_URL`, injeta
   `Authorization: Bearer <token>` automaticamente, trata 401 globalmente (limpa sessão
   e redireciona para `/login`).

2. **Armazenamento de sessão** — usar **cookie** definido pelo próprio frontend
   (`js-cookie` ou API nativa) após o login, não `localStorage` puro, para permitir
   futura leitura em Server Components/middleware do Next se necessário. Documentar a
   escolha final no `agents/CLAUDE.md` (seção 5) ao concluir.

3. **`AuthContext`/`AuthProvider`** — expõe `user: UserResponseDto | null`, `login()`,
   `logout()`, `isLoading`. Ao carregar a aplicação, se houver token salvo, chama
   `GET /users/me` para restaurar a sessão.

4. **Proteção de rotas** — middleware ou wrapper de layout: sem sessão → redireciona
   para `/login`; rota `/admin/**` com `role !== 'admin'` → redireciona para fora;
   usuário já logado acessando `/login`/`/register` → redireciona para a área logada.

5. **Tema compartilhado** (`src/theme/`):
   - `tokens.ts` — valores brutos (cores, fontes, radius, spacing), copiados de
     `agents/design-system.md`.
   - `mui-theme.ts` — `createTheme()` do MUI consumindo `tokens.ts`.
   - `tailwind.config.ts` — `theme.extend` consumindo os mesmos valores de `tokens.ts`
     (import direto do arquivo TS, já que o config do Tailwind aceita TS/JS).

6. **Layout base** — header com nome do usuário (Avatar com iniciais, conforme
   `agents/design-system.md`, item 8), navegação simples, botão de logout.

7. **Páginas de autenticação**:
   - `/login` — formulário MUI (`TextField`, `Button`), validação client-side básica.
   - `/register` — formulário de cadastro de Student, com `Select`/`Autocomplete` do
     MUI para `course` (populado via `GET /courses`), campo `period` numérico.
     Validação client-side do domínio `@gsuite.iff.edu.br` é só UX — a validação real
     é sempre no backend.

## Requisitos técnicos obrigatórios

1. TypeScript com tipagem explícita, sem `any`, espelhando os DTOs acima em
   `src/types/`.
2. Tratamento de loading/erro em toda chamada assíncrona (usar `CircularProgress` do
   MUI para loading, `Alert`/`Snackbar` do MUI para erro).
3. Nunca hardcode a URL do backend fora do cliente HTTP centralizado.
4. Nenhuma tela de negócio (listagem/CRUD de vagas ou cursos) nesta etapa — é só
   fundação. Isso é responsabilidade das Etapas 05 e 06.

## Fora do escopo desta etapa

- Telas de listagem/CRUD de vagas e cursos (Etapas 05 e 06).
- Recuperação de senha (pendência em aberto).
- Dark mode (não faz parte do escopo, conforme `agents/design-system.md`).

## Critérios de aceite

- [ ] Cadastro de Student funciona ponta a ponta, com curso vindo da API real.
- [ ] Login funciona e a sessão persiste ao recarregar a página.
- [ ] Logout limpa a sessão e rotas protegidas voltam a redirecionar para `/login`.
- [ ] Uma rota `/admin/**` de teste redireciona um Student logado para fora.
- [ ] O tema MUI e as classes Tailwind usam visualmente a mesma paleta de cores (não
      há dois azuis/dois cinzas diferentes competindo na mesma tela).

## Ao finalizar

Atualize `agents/CLAUDE.md`: seção 5 (registrar a estratégia final de sessão/cookie
escolhida) e seção 7 (marcar fundação do frontend como concluída).