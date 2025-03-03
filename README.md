# ft_transcendence - a pong web app

> A pong app with a heap of add-on features

- Live demo: [https://example.com](https://example.com)

## Build Setup

- [something like git pull, setup .env]

## Build

1. Run docker container:
```bash
docker compose up --build -d
```

2. Open site at https://localhost:8443/

### Development

Edit .env to include only these environment variables:
```sh
DEV_HTTP_PORT=8080
```

- `docker compose up -d --build`

### Production

Edit .env to include only these environment variables:
```sh
PROD=1
DOMAIN=<your domain>
SCHEME=https # can also be http
```

- `docker compose up -d --build`

## Advanced/Configuration

- [administrative commands regarding app management]
- [basic steps for configuration]
- Refer to the [Wiki](https://github.com/cubernetes/ft_transcendence/wiki) for more Documentation

## Demo

- [a gif showcasing the main feature (pong)]
- [a gif showcasing the additional features (chat, accounts, etc.)]
- [opt: alt text: a gif showcasing the administrative features]

## Core Features
- Interactive webapp to play 3D pong - Front-End (John) && Back-End (Ben & Darren)
- Account management (TBD)
- Join matches via the a CLI client (or maybe [SSH](https://github.com/charmbracelet/wish), let's see) (TBD)
- Overkill security measures (ModSecurity, HashiCorp Vault, 2FA, JWT) - Timo
- AI opponent (TBD)
- Some accessibility features (TBD)
- Log management and observability (ELK + Grafana) - Sonia
- Game statistics also on Blockchain - John

## License

- [CC0 1.0 Universal](COPYING)
