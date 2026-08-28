FROM node:20-alpine AS base

WORKDIR /app

# Copy root workspace and backend package manifests
COPY package.json ./
COPY packages ./packages
COPY backend/package.json ./backend/

RUN npm install --workspace=backend --workspace=packages/shared

COPY backend ./backend

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start", "--workspace=backend"]
