# use a small Node runtime
FROM node:20-alpine

WORKDIR /app

# copy package files first for better caching
COPY package*.json ./
RUN npm ci --omit=dev

# copy rest of the code
COPY . .

# build TS if you use TS (make sure script "build" exists in package.json)
RUN npm run build

# run compiled output (adjust path if needed)
CMD ["node", "dist/bot.js"]
