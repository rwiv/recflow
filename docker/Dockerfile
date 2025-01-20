FROM node:22.4.0 AS build
WORKDIR /app
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY .npmrc .npmrc
COPY src src

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm nest build

FROM node:22.4.0-alpine
WORKDIR /app
COPY package.json package.json
COPY .npmrc .npmrc

RUN apk add git
RUN npm install -g pnpm
RUN pnpm install --prod
COPY --from=build /app/dist /app/dist

ENTRYPOINT ["node", "dist/main.js"]
