DC := docker compose
D := docker

.DEFAULT_GOAL := dev

.PHONY: dev
dev:
	HTTP_PORT=8080 HTTPS_PORT=8443 $(DC) up -d --build

.PHONY: prod
prod: # Don't forget to set DOMAIN and SCHEME in .env
	HTTP_PORT=80 HTTPS_PORT=443 PROD=1 $(DC) up -d --build

.PHONY: clean
clean:
	$(D) system prune -f # for super pristine cleaning do `prune --all --volume -f`
