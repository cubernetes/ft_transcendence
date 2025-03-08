DC := docker compose
D := docker

RM := rm -rf
DB := backend/drizzle/db.sqlite

.DEFAULT_GOAL := dev
-include .env
.EXPORT_ALL_VARIABLES:

.PHONY: dev
dev:
	HTTP_PORT=$(DEV_HTTP_PORT) \
	HTTPS_PORT=$(DEV_HTTPS_PORT) \
	DOMAINS=$(DEV_DOMAINS) \
	$(DC) up -d --build

.PHONY: prod
prod: # Don't forget to set DOMAIN and SCHEME in .env
	HTTP_PORT=$(PROD_HTTP_PORT) \
	HTTPS_PORT=$(PROD_HTTPS_PORT) \
	DOMAINS=$(PROD_DOMAINS) \
	$(DC) up -d --build

.PHONY: down
down:
	HTTP_PORT=$(DEV_HTTP_PORT) HTTPS_PORT=$(DEV_HTTPS_PORT) DOMAINS=$(DEV_DOMAINS) $(DC) down

.PHONY: clean
clean: down
	$(RM) $(DB)
	$(D) system prune -f # for super pristine cleaning do `prune --all --volume -f`

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

.PHONY: nodemon
nodemon: fclean install
	$(SHELL) -c "cd backend && npm run build:dev &"
	$(DC) up -d --build

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