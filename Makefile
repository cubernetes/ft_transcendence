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
	@# See wiki for explanation of the commands: https://github.com/cubernetes/ft-transcendence/wiki/Makefile-dev%E2%80%90tls-target-explanation

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
