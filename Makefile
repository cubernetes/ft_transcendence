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
	$(DC) down
	$(D) system prune -f # for super pristine cleaning do `prune --all --volume -f`


.PHONY: deepclean
deepclean:
	$(DC) down -v
	sudo rm backend/data/database.sqlite
	@docker ps -aq | xargs -r docker stop || true
	@docker ps -aq | xargs -r docker rm || true
	@docker images -q | xargs -r docker rmi || true
	@docker volume prune -f || true
	@docker network prune -f || true
	@docker system prune -a --volumes -f || true
	@docker compose down -v || true
