# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Increase Node.js memory limit and optimize for build
ENV NODE_OPTIONS="--max-old-space-size=4096"
# Don't set NODE_ENV=production here as it would skip dev dependencies
ENV NODE_ENV=development

# Accept build argument
ARG DOCKER_BUILD=true
ENV DOCKER_BUILD=$DOCKER_BUILD

# Copy package files and install dependencies
COPY package.json package-lock.json ./
# Install all dependencies including dev dependencies
RUN npm ci

# Verify vite is installed
RUN ls -la node_modules/.bin/
RUN test -f node_modules/.bin/vite || echo "Vite not found"

# Copy the rest of the application code
COPY . .

# Build the application with production environment
RUN NODE_ENV=production npm run build

# Production stage
FROM nginx:alpine

# Copy the build output from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 