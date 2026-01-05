# syntax = docker/dockerfile:1
ARG NODE_VERSION=20.18.1
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app
ARG YARN_VERSION=1.22.22
RUN npm install -g yarn@$YARN_VERSION --force

FROM base AS build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# prune dev deps
RUN yarn install --production=true --frozen-lockfile && yarn cache clean

FROM base AS final
ENV NODE_ENV=production

# копируем только необходимое
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/yarn.lock /app/yarn.lock
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

EXPOSE 3000
CMD ["yarn", "start"]
