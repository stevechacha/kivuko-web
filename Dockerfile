FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG EXPO_PUBLIC_API_URL=https://kivuko-api-production.up.railway.app
ARG EXPO_PUBLIC_ADMIN_API_KEY=MUUNGANO2026
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_ADMIN_API_KEY=$EXPO_PUBLIC_ADMIN_API_KEY

RUN npm run build && test -f dist/index.html

FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./

EXPOSE 8080

CMD ["node", "server.js"]
