FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci

# Copy full app
COPY . .

# Build frontend
RUN npm run build

# ✅ Install serve globally AND locally to ensure it's available
RUN npm install -g serve && npm install serve

ENV NODE_ENV=production
EXPOSE 8080

# ✅ Use npx to ensure serve is found, with Cloud Run's PORT
CMD ["sh", "-c", "npx serve -s dist -l ${PORT:-8080} --single --no-clipboard"]