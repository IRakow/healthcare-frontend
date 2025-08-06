FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

RUN npm install -g serve

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# ✅ Use shell form so $PORT gets passed correctly by Cloud Run
CMD serve -s dist -l $PORT --single