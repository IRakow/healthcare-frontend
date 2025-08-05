# Use glibc-based Node.js for compatibility (NOT Alpine)
FROM node:18

# Create working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the full project source
COPY . .

# Build the project (Vite)
RUN npm run build

# Set environment variable for Vite preview server
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the preview server (or replace with your custom server if using SSR)
CMD ["npm", "run", "preview"]