#!/bin/sh

# Wrapper script to discern between production and development mode
# Takes a Caddyfile with SCHEME and DOMAIN variables and uses envsubst to replaces those
# This script is usually run with only 1 argument, usually `run` or `reload`

export SCHEME DOMAIN

if [ "$PROD" = "1" ]; then
	: "${SCHEME:=https}"
	: "${DOMAIN:=localhost}"
	printf '\033\133;42;30m%s\033\133m\n' "${1}ing Caddy with production config ($SCHEME://$DOMAIN)"
else
	SCHEME='http'
	DOMAIN='localhost'
	printf '\033\133;43;30m%s\033\133m\n' "${1}ing Caddy with development config ($SCHEME://$DOMAIN)"
fi

/usr/bin/caddy "$@" --adapter caddyfile --config - <<EOF
$(envsubst "\$SCHEME,\$DOMAIN" < /etc/caddy/Caddyfile.template)
EOF
