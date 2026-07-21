# Etapa 07 — Revisão de Pendências, Endurecimento e Preparo para Produção

> **Leitura obrigatória antes de executar qualquer ação:** `agents/CLAUDE.md` e todas as
> etapas 01–06. Esta etapa só deve começar quando o fluxo funcional completo (cadastro,
> login, CRUD de cursos/vagas, listagem/filtro, redirecionamento e compartilhamento)
> já estiver funcionando de ponta a ponta em ambiente local.

## Objetivo desta etapa

Fechar as pendências deixadas em aberto no `agents/CLAUDE.md` (seção 8) que forem
decididas pelo usuário, e revisar o sistema como um todo em busca de brechas de
segurança, más práticas ou inconsistências com as regras de negócio, antes de considerar
o projeto pronto para uso real pela comunidade do IFF.

## Esta etapa é diferente das anteriores

Ao contrário das Etapas 01–06, que têm escopo fechado, esta etapa é uma **checklist de
revisão** — não gere código novo direto. Para cada item abaixo, primeiro **confirme com
o usuário** se aquilo deve ser implementado agora ou permanece como pendência, pois
várias dessas decisões dependem de escolhas de produto que ainda não foram fechadas
(ver `CLAUDE.md`, seção 8).

## Checklist de pendências de produto (perguntar antes de implementar)

- [ ] **Verificação de e-mail real** — provedor definido (Resend recomendado)?
      `EMAIL_VERIFICATION_ENABLED` deve ir para `true` em produção. Se sim, implementar
      o envio real via Nodemailer + provedor escolhido, substituindo o stub da Etapa 01.
- [ ] **Recuperação de senha** — fluxo será implementado? Se sim, especificar com o
      usuário antes de codar (e-mail com link temporário vs. código, expiração do token).
- [ ] **Paginação da listagem de vagas** — quantidade por página definida?
- [ ] **Notificação de novas vagas por curso** — será implementada? Por qual canal
      (e-mail, push, nenhum)?
- [ ] **Painel de estatísticas do Admin** — será implementado? Quais métricas?
- [ ] **Auditoria/logs de ações do Admin** — será implementado? Qual nível de detalhe?
- [ ] **Identidade visual/design system** — existe uma direção visual definida, ou o
      frontend segue com a base funcional da Etapa 04 mesmo em produção?

## Checklist de segurança e boas práticas (revisar sempre, independente de decisão de produto)

- [ ] `JWT_SECRET` de produção é diferente do usado em desenvolvimento e nunca foi
      compartilhado fora do ambiente seguro do projeto.
- [ ] `ADMIN_SEED_PASSWORD` de produção não é a mesma senha temporária usada em
      desenvolvimento — deve ser trocada após o primeiro login do Admin real.
- [ ] Rate limiting básico nas rotas de autenticação (`/auth/login`, `/auth/register`)
      para mitigar força bruta — avaliar `@nestjs/throttler`.
- [ ] CORS do backend configurado para aceitar apenas a origem real do frontend em
      produção (não `*`).
- [ ] Todas as rotas de escrita (`POST`/`PATCH`/`DELETE`) revisadas quanto a guards de
      autenticação e de role — nenhuma rota administrativa exposta sem `RolesGuard`.
- [ ] Nenhum dado sensível (`passwordHash`, secrets) retornado em nenhuma resposta de
      API — revisar serialização de todos os endpoints, não só os de usuário.
- [ ] Variáveis de ambiente de produção (Atlas, JWT, e-mail) configuradas no provedor
      de hospedagem escolhido, nunca commitadas — `.env.example`/`.env.local.example`
      continuam sendo os únicos arquivos de ambiente versionados.
- [ ] `Network Access` do MongoDB Atlas revisado — `0.0.0.0/0` foi usado em
      desenvolvimento; avaliar restringir para o IP do servidor de produção quando ele
      for definido.
- [ ] Validação de todos os DTOs revisada — nenhum endpoint aceita campos além dos
      esperados (`whitelist: true` no `ValidationPipe` global do Nest).

## Checklist de consistência com as regras de negócio (revisão funcional final)

- [ ] RN15 (ordenação LIFO) confirmada em produção com dados reais, não só em
      ambiente local com poucos registros.
- [ ] RN22 (sem expiração automática) — confirmar que nenhum job/cron foi
      inadvertidamente criado em nenhuma etapa anterior.
- [ ] RN14 (sem candidatura interna) — revisão final garantindo que nenhum endpoint de
      "aplicação"/"inscrição" foi criado em nenhum momento do desenvolvimento.
- [ ] RN01/RN03 — domínio institucional e ausência de cadastro público de Admin
      revisados uma última vez antes do sistema ficar acessível à comunidade do IFF.

## Ao finalizar

Esta é a última etapa planejada neste conjunto de contexts. Ao concluí-la, atualize o
`agents/CLAUDE.md` por completo: mova todos os itens decididos da seção 8 (Pendências)
para a seção 3 (Regras de Negócio) ou seção 5 (Stack), conforme o caso, e marque a
seção 7 (Estado atual) como concluída para o escopo fechado no `README.md`. Qualquer
funcionalidade nova a partir daqui deve gerar um novo arquivo de contexto
(`agents/08-...md`) em vez de ser encaixada retroativamente nas etapas anteriores.
