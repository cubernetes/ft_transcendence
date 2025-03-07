FROM node:18-alpine AS builder

WORKDIR /app

COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM node:20-alpine AS production

# Install build dependencies for bcrypt and other native modules
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    && apk add --no-cache --update bash \
    && apk del .build-deps

WORKDIR /app

# Copy package files to install dependencies first
COPY ./package*.json ./
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/drizzle /app/drizzle

RUN npm install --production

CMD ["npm", "start"]
#CMD ["node", "--trace-warnings", "dist/index.js"]