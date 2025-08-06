FROM node:18

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci

# Copy full app
COPY . .

# Build frontend
RUN npm run build

# ✅ Install serve globally AFTER build step
RUN npm install -g serve

ENV NODE_ENV=production
EXPOSE 8080

# ✅ Start app using Cloud Run's assigned PORT
CMD ["/bin/sh", "-c", "serve -s dist -l $PORT --single"]