## ----------- Build stage -----------
FROM node:20-alpine AS build

WORKDIR /app

# Install deps with better Docker cache use
COPY package*.json ./
RUN npm ci || npm install

# Copy sources and build
COPY . ./
RUN npm run build

## ----------- Runtime stage -----------
FROM nginx:1.27-alpine AS runtime

# Copy custom nginx config (SPA fallback + caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]