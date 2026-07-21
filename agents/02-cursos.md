# Etapa 02 — CRUD de Cursos (Course)

> **Leitura obrigatória antes de executar qualquer ação:** `agents/CLAUDE.md` e
> `agents/01-auth-e-usuarios.md`. Esta etapa **depende da Etapa 01 já estar concluída**
> (autenticação JWT, guards de role e schema de `User` funcionando). Se a Etapa 01 não
> estiver pronta, avise o usuário antes de prosseguir em vez de implementar fora de ordem.

## Objetivo desta etapa

Implementar o CRUD completo da entidade `Course`, que serve de base tanto para o cadastro
de Student (Etapa 01, campo `course`) quanto para a criação de vagas (Etapa 03, campo
`courses`). É uma etapa pequena e isolada, mas é pré-requisito bloqueante para a Etapa 03.

## Escopo funcional (RN09 do CLAUDE.md)

- Curso é uma **lista fixa e gerenciável pelo Admin** — não é texto livre digitado nas
  outras entidades. Nenhum outro módulo deve aceitar nome de curso como string solta;
  sempre como referência (`ObjectId`) a um documento `Course` existente.
- Apenas Admin pode criar, editar ou desativar cursos.
- Student e visitantes autenticados podem apenas **listar** cursos ativos (necessário
  para popular o filtro de vagas e o formulário de cadastro/edição de perfil).

## Modelo de dados

```typescript
// course.schema.ts
{
  name: string;       // unique, trim — ex: "Análise e Desenvolvimento de Sistemas"
  isActive: boolean;  // default true
  createdAt, updatedAt;
}
```

> Não adicione campos além destes sem confirmar com o usuário — o escopo fechado no
> `README.md`/`CLAUDE.md` não prevê nada como "coordenador do curso", "carga horária",
> etc. Se achar que algum campo adicional seria útil, **pergunte antes de adicionar**,
> não implemente por conta própria.

## Endpoints esperados

| Método | Rota | Quem acessa | Descrição |
|---|---|---|---|
| POST | `/courses` | Admin | Cria um novo curso |
| GET | `/courses` | Autenticado (Admin ou Student) | Lista cursos (por padrão, apenas `isActive: true`; Admin pode passar query `?includeInactive=true`) |
| GET | `/courses/:id` | Autenticado | Detalhe de um curso |
| PATCH | `/courses/:id` | Admin | Edita nome/status de um curso |
| DELETE | `/courses/:id` | Admin | **Soft delete** (`isActive: false`), nunca remoção física — cursos podem já estar referenciados por Students ou Jobs |

## Requisitos técnicos obrigatórios

1. Nome de curso deve ser único (`unique: true` no schema + tratamento de erro de
   duplicidade retornando 409/400 com mensagem clara, não um erro cru do Mongo).
2. `DELETE /courses/:id` **não remove o documento** — apenas marca `isActive: false`.
   Justifique isso no código com um comentário, pois cursos desativados ainda podem
   estar referenciados por `User.course` ou `Job.courses` existentes.
3. Antes de desativar um curso, não é necessário (nesta etapa) verificar se há
   Students ou Jobs vinculados — isso é uma regra que pode ser reforçada depois, mas
   registre como comentário `// TODO` no código para não ser esquecido.
4. Endpoint `GET /courses` deve suportar ordenação alfabética por `name` por padrão.
5. Proteger rotas de escrita (`POST`, `PATCH`, `DELETE`) com o mesmo `RolesGuard` de
   Admin criado na Etapa 01 — reutilize, não recrie a lógica de guard.

## Fora do escopo desta etapa

- Qualquer relação com `Job` (isso só existe a partir da Etapa 03).
- Validação cruzada de "curso em uso" ao desativar (ver TODO acima).
- Frontend (Etapas 04+).

## Critérios de aceite

- [ ] Admin consegue criar, listar, editar e desativar cursos via API.
- [ ] Student autenticado consegue listar cursos ativos, mas recebe 403 ao tentar
      criar/editar/desativar.
- [ ] Tentar criar curso com nome duplicado retorna erro tratado (não stacktrace cru).
- [ ] Curso desativado não aparece na listagem padrão (`GET /courses` sem query),
      mas aparece com `?includeInactive=true` para o Admin.

## Ao finalizar

Atualize a seção 7 do `agents/CLAUDE.md` marcando o CRUD de Course como concluído.
Confirme ao usuário que a Etapa 03 (Jobs) já pode começar, pois depende desta.
