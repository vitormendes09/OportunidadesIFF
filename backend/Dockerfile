# syntax=docker/dockerfile:1

# ---------- Estágio 1: dependências + build ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Copia apenas os manifests primeiro para aproveitar o cache de camadas:
# enquanto package.json/package-lock.json não mudarem, o npm ci não roda de novo.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Remove as devDependencies, deixando só o necessário para rodar.
RUN npm prune --omit=dev

# ---------- Estágio 2: imagem final ----------
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Roda como usuário sem privilégios (a imagem node já traz o usuário "node").
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json ./package.json

USER node

EXPOSE 3001

CMD ["node", "dist/main"]
