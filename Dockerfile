# Use Node with glibc (NOT Alpine, avoids musl issues)
FROM node:18

# Set working directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm ci

# Copy entire app source
COPY . .

# Build your Vite frontend
RUN npm run build

# Install static file server globally
RUN npm install -g serve

# Define environment and port for Cloud Run
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Serve the production build
CMD ["serve", "-s", "dist", "-l", "8080"]