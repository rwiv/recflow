FROM node:22.4.0 AS guiBuild
WORKDIR /app
COPY . .
WORKDIR /app/web
RUN npm install -g pnpm
RUN pnpm install --force
RUN pnpm build

FROM node:22.4.0 AS serverBuild
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install --force
RUN pnpm build

FROM node:22.4.0-alpine
WORKDIR /app
COPY package.json package.json
COPY .npmrc .npmrc

RUN apk add git
RUN npm install -g pnpm
RUN pnpm install --prod --force
COPY --from=guiBuild /app/web/dist /app/public
COPY --from=serverBuild /app/dist /app/dist

ENTRYPOINT ["node", "dist/main.js"]
