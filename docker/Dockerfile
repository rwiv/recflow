FROM node:22.4.0 AS guibuild
WORKDIR /app
COPY . .
WORKDIR /app/web
RUN npm install -g pnpm
RUN pnpm install --force
RUN pnpm build

FROM node:22.4.0 AS serverbuild
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install --force
RUN pnpm build

FROM node:22.4.0-alpine
WORKDIR /app
COPY package.json package.json
COPY .npmrc .npmrc

RUN apk add --no-cache git
RUN npm install -g pnpm
RUN pnpm install --prod --force
COPY --from=guibuild /app/web/dist /app/public
COPY --from=serverbuild /app/dist /app/dist

ENTRYPOINT ["node", "dist/main.js"]
