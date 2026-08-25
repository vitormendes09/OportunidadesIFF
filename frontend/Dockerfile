# syntax=docker/dockerfile:1

# ---------- Estágio 1: dependências ----------
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---------- Estágio 2: build ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ATENÇÃO: variáveis NEXT_PUBLIC_* são embutidas no bundle DURANTE O BUILD,
# não lidas em tempo de execução. Por isso a URL da API entra como build arg.
# Como o navegador do usuário é quem chama a API, este valor precisa ser um
# endereço acessível a partir da MÁQUINA HOST (ex: http://localhost:3001),
# nunca o nome interno do serviço no Compose (http://backend:3001).
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- Estágio 3: imagem final ----------
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# A saída "standalone" (configurada em next.config.ts) já traz o server.js e
# apenas as dependências realmente usadas em runtime.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
