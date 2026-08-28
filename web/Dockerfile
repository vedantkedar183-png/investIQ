FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY packages ./packages
COPY web/package.json ./web/

RUN npm install --workspace=web --workspace=packages/shared

COPY web ./web

WORKDIR /app/web
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/web/.next ./.next
COPY --from=builder /app/web/public ./public
COPY --from=builder /app/web/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
