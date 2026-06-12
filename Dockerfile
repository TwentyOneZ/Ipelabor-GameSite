# Multi-stage Dockerfile for Portal do Contador Parceiro - Ipê Labor

# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies using clean install
RUN npm ci

# Stage 2: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client and build the Next.js app
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV production
ENV PORT 7002
ENV NEXT_TELEMETRY_DISABLED 1

# Copy necessary files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./.env

EXPOSE 7002

# Startup command to push schema, seed db if empty, and start Next.js
CMD npx prisma db push && node prisma/seed.js && npm run start
