DC := docker compose
D := docker

.DEFAULT_GOAL := dev

include .env
include config.env
.EXPORT_ALL_VARIABLES:

.PHONY: check-env
check-env:
	@test -f .env || cp .env.example .env

.PHONY: dev
dev: check-env
	[ -n "$(DEV_HTTP_PORT)" ] && \
	[ -n "$(DEV_HTTPS_PORT)" ] && \
	[ -n "$(DEV_SITES)" ] && \
	HTTP_PORT="$(DEV_HTTP_PORT)" \
	HTTPS_PORT="$(DEV_HTTPS_PORT)" \
	SITES="$(DEV_SITES)" \
	CADDY_EXTRA_GLOBAL_DIRECTIVES="$$(printf 'auto_https disable_redirects')" \
	CADDY_EXTRA_SITE_DIRECTIVES="$$(printf 'tls internal')" \
	$(DC) up -d --build

.PHONY: dev
dev-tls: check-env
	[ -n "$(DEV_HTTP_PORT)" ] && \
	[ -n "$(DEV_HTTPS_PORT)" ] && \
	[ -n "$(DEV_SITES)" ] && \
	HTTP_PORT="$(DEV_HTTP_PORT)" \
	HTTPS_PORT="$(DEV_HTTPS_PORT)" \
	SITES="$$(printf %s "$(DEV_SITES)" | sed 's/http\(:\/\/[^[:space:]]*\)\( \|$$\)/http\1 https\1 /g')" \
	CADDY_EXTRA_GLOBAL_DIRECTIVES="$$(printf 'auto_https disable_redirects')" \
	CADDY_EXTRA_SITE_DIRECTIVES="$$(printf 'tls internal')" \
	$(DC) up -d --build
	@# Explanation of the SITES variable:
	@# - $(DEV_SITES) is a space-separated list of sites (i.e. "http://localhost https://whatever http://127.0.0.1")
	@# - then we're printing that string and pipe it through sed to do some transormation of that strings
	@# - namely, what we want is do turn every http site into a https site (for tls), BUT ALSO keep the old http site
	@# - Therefore, the example string from above would turn into this:
	@# - "http://localhost https://localhost https://whatever http://127.0.0.1 https://127.0.0.1"
	@# - note that both http sites got turned into https sites, but the one https site that was already there was not downgraded to http, this is intentional
	@# - The sed command matches for sites by searching for this pattern: 'http\(:\/\/[^[:space:]]*\) '
	@# - That pattern captures the part after the http. In the replacement, it then uses the capture twice to generate the http and also the https site.
	@# Explanation of the CADDY_EXTRA_GLOBAL_DIRECTIVES variable:
	@# - This one is merely to add extra directives to caddy. The reason to put it inside a printf call is to allow
	@#   for multiple lines (== multiple directives). The 'auto_https disable_redirects' directive is to disable
	@#   automatic redirect from http to https
	@# Explanation of the CADDY_EXTRA_SITE_DIRECTIVES variable:
	@# - Similar to the other CADDY... variable, this one is to add directives to the main site block in the Caddyfile
	@#   which is needed because especially for local development we want to use self-signed certificates and therefore
	@#   need to specify the 'tls internal' option

.PHONY: prod
prod: check-env
	[ -n "$(PROD_HTTP_PORT)" ] && \
	[ -n "$(PROD_HTTPS_PORT)" ] && \
	[ -n "$(PROD_SITES)" ] && \
	HTTP_PORT="$(PROD_HTTP_PORT)" \
	HTTPS_PORT="$(PROD_HTTPS_PORT)" \
	SITES="$(PROD_SITES)" \
	$(DC) up -d --build

.PHONY: down
down:
	$(DC) down

.PHONY: clean
clean: down
	[ -n "$(DB_PATH)" ] && $(RM) backend/$(DB_PATH)
	$(D) system prune -f

.PHONY: deepclean
deepclean: clean
	$(D) ps -aq | xargs -r docker stop || true
	$(D) ps -aq | xargs -r docker rm || true
	$(D) images -q | xargs -r docker rmi || true
	$(D) volume prune -f || true
	$(D) network prune -f || true
	$(D) system prune -a --volumes -f || true
	$(DC) down -v || true

.PHONY: fclean
fclean: deepclean
	$(RM) -r backend/node_modules/ backend/dist/
	$(RM) -r web/node_modules/ web/dist/

.PHONY: re
re: clean
	$(MAKE) dev

.PHONY: install
install:
	npm --prefix=web install
	npm --prefix=backend install
