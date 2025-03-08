DC := docker compose
D := docker

DB := backend/drizzle/db.sqlite

.DEFAULT_GOAL := dev
include .env
.EXPORT_ALL_VARIABLES:

.PHONY: check-env
check-env:
	@test -f .env || cp .env.example .env

.PHONY: dev
dev: check-env
	HTTP_PORT=$(DEV_HTTP_PORT) \
	HTTPS_PORT=$(DEV_HTTPS_PORT) \
	DOMAINS=$(DEV_DOMAINS) \
	$(DC) up -d --build

.PHONY: prod
prod: check-env
	HTTP_PORT=$(PROD_HTTP_PORT) \
	HTTPS_PORT=$(PROD_HTTPS_PORT) \
	DOMAINS=$(PROD_DOMAINS) \
	$(DC) up -d --build

.PHONY: down
down:
	$(DC) down

.PHONY: clean
clean: down
	$(RM) $(DB)
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
	$(RM) backend/node_modules/ backend/dist/
	$(RM) web/node_modules/ web/dist/

.PHONY: re
re: clean dev

.PHONY: install
install:
	npm --prefix=web install
	npm --prefix=backend install

EXTS := ts json
SPACE := $(empty) $(empty)
EXTS_PATTERN := $(subst $(SPACE),|,$(EXTS))  # Convert "ts json" → "ts|json"
PRETTIER := npx --prefix=backend prettier --write

.PHONY: format format-staged
format:
	$(PRETTIER) $(addprefix "**/*.",$(EXTS))

# Only formats staged files, seems as a popular thing to have and seems to be working
format-staged:
	git diff --name-only --cached --diff-filter=ACM | grep -E '\.($(EXTS_PATTERN))$$' | xargs $(PRETTIER)