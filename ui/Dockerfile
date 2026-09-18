FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json *.lock ./
RUN yarn install --production=false --frozen-lockfile
COPY . .
RUN yarn build

FROM node:22-alpine AS runner
WORKDIR /app
COPY package*.json *.lock ./
RUN yarn install --production=true --frozen-lockfile
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle.config.* ./
COPY --from=builder /app/drizzle ./drizzle
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
CMD ["node", "build"]
