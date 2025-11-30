FROM node:22.4.0-alpine AS guibuild
WORKDIR /app
COPY . .
WORKDIR /app/web
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

FROM node:22.4.0-alpine AS serverbuild
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

FROM node:22.4.0-alpine AS serverdeps
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install --prod

FROM node:22.4.0-alpine
WORKDIR /app
COPY package.json package.json

COPY --from=guibuild /app/web/dist /app/public
COPY --from=serverbuild /app/dist /app/dist
COPY --from=serverdeps /app/node_modules /app/node_modules

ENTRYPOINT ["node", "dist/main.js"]
