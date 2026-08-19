# syntax=docker/dockerfile:1

# --- deps: install dependencies in their own cacheable layer -----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- builder: build the app with the deps layer already warm ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runner: minimal production image, non-root, standalone server ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Standalone output already contains only the files the server needs to
# run: no full node_modules, no source, no devDependencies in this image.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# `node` user/group already exist in the official Next.js Docker examples'
# base image; run unprivileged (least-privilege principle).
USER node

EXPOSE 3000
CMD ["node", "server.js"]
