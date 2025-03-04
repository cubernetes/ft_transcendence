DC := docker compose
D := docker

.DEFAULT_GOAL := dev

.PHONY: dev
dev:
	$(DC) up -e HTTP_PORT=8080 -e HTTPS_PORT=8443 -d --build

.PHONY: prod
prod: # Don't forget to set DOMAIN and SCHEME in .env
	$(DC) up -e HTTP_PORT=80 -e HTTPS_PORT=443 -e PROD=1 -d --build

.PHONY: clean
clean:
	$(D) system prune -f # for super pristine cleaning do `prune --all --volume -f`
