FROM node:22.4.0-alpine AS base
WORKDIR /app
COPY . .
RUN npm install -g pnpm

FROM base AS guibuild
WORKDIR /app/web
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM base AS serverbuild
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM base AS serverdeps
RUN pnpm install --prod --frozen-lockfile

FROM node:22.4.0-alpine
WORKDIR /app
COPY package.json package.json

COPY --from=guibuild /app/web/dist /app/public
COPY --from=serverbuild /app/dist /app/dist
COPY --from=serverdeps /app/node_modules /app/node_modules

ENTRYPOINT ["node", "dist/main.js"]
