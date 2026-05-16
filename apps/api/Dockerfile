# Development Dockerfile with hot reload via ts-node-dev
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy root package files
COPY package.json yarn.lock* package-lock.json* ./

# Copy workspace package files
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY packages/types ./packages/types
COPY apps/api ./apps/api

EXPOSE 4000

# ts-node-dev watches for changes and restarts automatically
CMD ["npm", "run", "dev", "--workspace=apps/api"]