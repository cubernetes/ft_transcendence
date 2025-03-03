FROM node:20-alpine

# Install build dependencies for bcrypt and other native modules
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    && apk add --no-cache --update bash \
    && apk del .build-deps

WORKDIR /app

# Copy package files to install dependencies first
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app files
COPY . .

CMD ["npm", "start"]
