# Índice — Contexts de Desenvolvimento (Oportunidades IFF)

Este arquivo explica como usar os documentos desta pasta. **Não é regra de negócio nem
escopo** — é um guia de navegação para você (e para qualquer IA de agente) saber qual
arquivo ler em cada momento do desenvolvimento.

## Ordem de leitura obrigatória, sempre

1. **`CLAUDE.md`** — sempre o primeiro arquivo a ser lido, em qualquer sessão de
   trabalho, independente da etapa. É a fonte de verdade do projeto: escopo, regras de
   negócio, entidades, stack, estado atual e pendências.
2. **`design-system.md`** — obrigatório também para qualquer etapa de frontend (04, 05,
   06): define a identidade visual (cores, tipografia, tokens) e a decisão de stack
   Tailwind + MUI, extraída do mockup de referência do produto.
3. **O arquivo da etapa atual** (ex: `02-cursos.md`) — o contexto específico da tarefa
   sendo executada agora.
4. **Os arquivos das etapas anteriores já concluídas**, se a etapa atual depender
   explicitamente delas (cada arquivo de etapa indica no topo quais outras etapas são
   pré-requisito).

## Etapas do projeto, em ordem de execução

| # | Arquivo | Camada | Depende de |
|---|---|---|---|
| — | `design-system.md` | Frontend (referência) | — (consultar junto de qualquer etapa de frontend) |
| 01 | `01-auth-e-usuarios.md` | Backend | — (primeira etapa de negócio) |
| 02 | `02-cursos.md` | Backend | Etapa 01 |
| 03 | `03-vagas.md` | Backend | Etapas 01 e 02 |
| 04 | `04-frontend-fundacao.md` | Frontend | Etapas 01, 02 e 03 (API completa) + `design-system.md` |
| 05 | `05-frontend-painel-admin.md` | Frontend | Etapa 04 |
| 06 | `06-frontend-painel-aluno.md` | Frontend | Etapa 04 |
| 07 | `07-revisao-e-producao.md` | Full-stack | Etapas 01–06 concluídas |

**Status atual confirmado:** Etapas 01, 02 e 03 (backend completo) já foram
implementadas e validadas contra o código-fonte real do projeto. As próximas etapas
a executar são 04, 05 e 06 (frontend).

As etapas 05 e 06 podem ser feitas em paralelo ou em qualquer ordem entre si, ambas
dependem apenas da 04 estar pronta.

## Regra para qualquer agente de IA usando estes arquivos

Antes de executar qualquer tarefa de desenvolvimento neste projeto:

1. Leia `CLAUDE.md` inteiro.
2. Identifique qual etapa o pedido do usuário se encaixa (se não estiver claro,
   pergunte ao usuário em vez de assumir).
3. Leia o arquivo da etapa correspondente inteiro, incluindo as seções "Fora do escopo"
   e "Critérios de aceite" — elas existem justamente para evitar retrabalho e escopo
   excedente.
4. Verifique na seção 7 do `CLAUDE.md` se os pré-requisitos daquela etapa já estão
   marcados como concluídos. Se não estiverem, avise o usuário antes de prosseguir.
5. Ao finalizar a tarefa, atualize a seção 7 do `CLAUDE.md` e informe claramente ao
   usuário o que foi feito, o que falta e como testar.

## Ao surgir uma funcionalidade nova, fora das 7 etapas

Não encaixe retroativamente em um arquivo de etapa já existente. Crie um novo arquivo
`08-nome-da-funcionalidade.md` seguindo o mesmo padrão de estrutura destes (objetivo,
escopo funcional referenciando RNs do `CLAUDE.md`, modelo de dados se houver, endpoints,
requisitos técnicos, fora do escopo, critérios de aceite) e adicione uma linha nova
nesta tabela de índice.