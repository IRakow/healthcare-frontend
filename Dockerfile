FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build
RUN npm install -g serve

ENV NODE_ENV=production

# Don't set a fixed PORT. Cloud Run will inject PORT=3000 or 8080 or another port
EXPOSE 8080

# ✅ Use shell so $PORT resolves dynamically
CMD ["/bin/sh", "-c", "serve -s dist -l $PORT --single"]