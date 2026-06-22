# Sydney Fishing API — production image (Lightsail Container Service / ECS Fargate ready).
# sharp ships musl prebuilt binaries, so node:20-alpine works without a build toolchain.
FROM node:20-alpine

WORKDIR /app

# Install prod deps first (better layer caching).
COPY package*.json ./
RUN npm ci --omit=dev

# App source.
COPY . .

# Local uploads dir (only used when STORAGE_DRIVER=local) must be writable by the runtime user.
RUN mkdir -p uploads && chown -R node:node /app

# Drop root.
USER node

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Basic liveness check used by the container platform.
HEALTHCHECK --interval=30s --timeout=4s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1

CMD ["node", "src/server.js"]
