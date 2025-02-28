# Build Stage: TypeScript + Webpack
FROM node:18 AS web-builder
WORKDIR /app

# Install dependencies and build
COPY package.json package-lock.json ./
RUN npm install

COPY tsconfig.json webpack.config.js ./
COPY dist/ dist/
COPY src/ src/
RUN npm run build

# Build Stage: Custom Caddy with Coraza WAF
FROM caddy:2.9.1-builder-alpine AS builder

# Needed because of CGO_ENABLED=1 below
RUN apk update && apk add build-base

# statically compile caddy
RUN CGO_ENABLED=1 XCADDY_GO_BUILD_FLAGS="-ldflags='-linkmode external -extldflags -static'" \
	xcaddy build --with github.com/corazawaf/coraza-caddy/v2

# always try to make PID 1 unprivileged
RUN addgroup caddy
RUN adduser -h /srv -S caddy -G caddy

FROM alpine:3.21.3

# needed for envsubsts in caddy-wrapper.sh
RUN apk --no-cache add gettext

COPY --from=builder /usr/bin/caddy /usr/bin/caddy
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group
COPY                ./caddy-wrapper.sh /caddy-wrapper.sh
COPY                ./Caddyfile.template /etc/caddy/Caddyfile.template

# Copy built site from Node.js build stage
COPY --from=web-builder /app/dist /srv

# ensure directories and correct owners
RUN rm -rf            /data /config /srv /static && \
	mkdir             /data /config /srv         && \
	chown caddy:caddy /data /config /srv

# Bind mount would be better, but gives weird error: "open /static: stale NFS file handle"
COPY --chown=caddy:caddy ./static /static

WORKDIR /srv

EXPOSE 8080
EXPOSE 8443

USER caddy

ENTRYPOINT ["/caddy-wrapper.sh"]

CMD ["run"]
