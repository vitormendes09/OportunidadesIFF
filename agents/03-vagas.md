# Etapa 03 — CRUD de Vagas (Job) + Listagem/Filtro para o Aluno

> **Leitura obrigatória antes de executar qualquer ação:** `agents/CLAUDE.md`,
> `agents/01-auth-e-usuarios.md` e `agents/02-cursos.md`. Esta é a entidade central do
> sistema — depende de `User` (autenticação/roles) e `Course` já existirem e
> funcionarem. Se qualquer uma das etapas anteriores não estiver concluída, avise antes
> de prosseguir.

## Objetivo desta etapa

Implementar a entidade `Job` (vaga), com CRUD completo para o Admin e endpoints de
consulta/filtro para o Student. Esta é a funcionalidade que mais concentra regras de
negócio do projeto — leia com atenção cada RN antes de codar.

## Escopo funcional (RN08, RN11–RN23 do CLAUDE.md)

- Apenas Admin cria, edita e remove (soft delete) vagas.
- Student apenas lista, filtra, vê detalhe e é redirecionado — **não há candidatura
  dentro do sistema** (RN14). Não crie nenhum endpoint de "aplicar para a vaga".
- **RN15 — Ordenação obrigatória:** toda listagem de vagas, sem exceção, deve ser
  ordenada por `publishedAt` decrescente (`sort({ publishedAt: -1 })`) — comportamento
  de pilha (LIFO), a vaga mais recente sempre aparece primeiro.
- **RN22 — Sem expiração automática:** vagas não expiram sozinhas. Elas somem da
  listagem apenas quando o Admin as desativa/remove manualmente (`isActive: false`).
  Não implemente nenhum job/cron de expiração por data.
- **RN21 — `applicationUrl` é obrigatório:** toda vaga precisa desse campo, pois é o
  único caminho de "candidatura" (redirecionamento externo).

## Modelo de dados

```typescript
// job.schema.ts
{
  title: string;
  companyName: string;
  description: string;
  contractType: 'CLT' | 'PJ' | 'Estágio' | 'Outro';
  workModel: 'Presencial' | 'Híbrido' | 'Remoto';
  companyLocation: string;
  workLocation: string;
  hasBenefits: boolean;
  benefitsDescription?: string;   // obrigatório apenas se hasBenefits === true
  salary?: string;                 // opcional, Admin pode omitir
  applicationUrl: string;          // obrigatório, deve ser uma URL válida
  courses: ObjectId[];             // ref 'Course', mínimo 1 item
  requiredPeriod?: number;
  specialties: string[];           // tags livres, default []
  isActive: boolean;               // default true
  publishedAt: Date;               // default Date.now, definido na criação
  createdBy: ObjectId;             // ref 'User' (role admin)
  createdAt, updatedAt;
}
```

## Endpoints esperados

| Método | Rota | Quem acessa | Descrição |
|---|---|---|---|
| POST | `/jobs` | Admin | Cria vaga (`publishedAt` e `createdBy` preenchidos automaticamente no backend, nunca recebidos do client) |
| GET | `/jobs` | Autenticado | Lista vagas ativas, ordenadas por `publishedAt` desc, com filtros via query params: `course`, `requiredPeriod`, `specialty` |
| GET | `/jobs/:id` | Autenticado | Detalhe completo da vaga |
| PATCH | `/jobs/:id` | Admin | Edita vaga |
| DELETE | `/jobs/:id` | Admin | Soft delete (`isActive: false`) |
| GET | `/jobs/admin` | Admin | Lista todas as vagas incluindo inativas (painel de gestão do Admin) |

## Requisitos técnicos obrigatórios

1. Validação de `courses`: cada `ObjectId` enviado deve corresponder a um `Course`
   existente e com `isActive: true` — rejeitar com erro claro se não existir.
2. Validação condicional: se `hasBenefits: true`, `benefitsDescription` passa a ser
   obrigatório (validar no DTO, não só no schema do Mongo).
3. Validação de `applicationUrl` como URL bem formada (`class-validator` `@IsUrl()`).
4. `GET /jobs` (visão do Student) deve **sempre** filtrar por `isActive: true` — nunca
   expor vaga desativada nesse endpoint.
5. Filtros devem ser combináveis (ex: `?course=<id>&requiredPeriod=5`) e a ausência de
   filtro retorna todas as vagas ativas.
6. `createdBy` deve vir do usuário autenticado (`req.user.sub`), nunca do body da
   requisição — mesmo que o client envie esse campo, ignore e sobrescreva no backend.
7. Popule (`populate`) o campo `courses` na resposta do `GET /jobs` e `GET /jobs/:id`
   para o frontend já receber o nome do curso, não apenas o `ObjectId`.

## Fora do escopo desta etapa

- Botão/lógica de compartilhamento (RN13) — isso é comportamento 100% de frontend
  (Web Share API do navegador), não precisa de endpoint dedicado no backend. Documentar
  isso para a Etapa 06 (painel do Student).
- Paginação da listagem — pendência em aberto no `CLAUDE.md`. Se o usuário não definir
  um tamanho de página, implemente sem paginação por enquanto, mas deixe a query
  preparada para aceitar `page`/`limit` no futuro sem quebrar contrato da API.
- Estatísticas de vagas (visualizações, etc.) — não solicitado no escopo.

## Critérios de aceite

- [ ] Admin cria vaga com todos os campos obrigatórios e ela aparece no topo da
      listagem (mais recente primeiro).
- [ ] Criar vaga com `hasBenefits: true` e sem `benefitsDescription` retorna erro 400.
- [ ] Criar vaga referenciando um `course` inexistente retorna erro 400/404 claro.
- [ ] Student consegue filtrar vagas por curso e por período.
- [ ] Vaga desativada pelo Admin desaparece do `GET /jobs` (visão do Student) mas
      continua aparecendo no `GET /jobs/admin`.
- [ ] Tentar criar/editar/remover vaga com token de Student retorna 403.

## Ao finalizar

Atualize a seção 7 do `agents/CLAUDE.md` marcando CRUD de Job e listagem/filtro como
concluídos. A partir daqui, o backend cobre 100% das regras de negócio centrais — as
próximas etapas são o frontend consumindo essa API.
