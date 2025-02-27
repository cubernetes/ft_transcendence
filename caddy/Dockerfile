FROM caddy:2.9.1-builder-alpine AS builder

RUN xcaddy build --with github.com/corazawaf/coraza-caddy/v2

FROM caddy:2.9.1-alpine

COPY --from=builder /usr/bin/caddy /usr/bin/caddy

COPY ./Caddyfile /etc/caddy/Caddyfile

RUN addgroup caddy && adduser -S caddy -G caddy

RUN chown -R caddy:caddy /data /config

USER caddy
