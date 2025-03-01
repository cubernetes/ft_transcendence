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

# ensure directories and correct owners
RUN rm -rf /data /config /srv && \
	mkdir /data /config /srv && \
	chown caddy:caddy /data /config /srv

WORKDIR /srv

EXPOSE 8080
EXPOSE 8443

USER caddy

ENTRYPOINT ["/caddy-wrapper.sh"]

CMD ["run"]
