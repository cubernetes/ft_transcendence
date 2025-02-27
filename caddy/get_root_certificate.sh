#!/bin/sh

docker exec caddy cat /data/caddy/pki/authorities/local/root.crt

# Redirect out to a file (i.e. root.crt)
# Then use like this with curl: curl --cacert root.crt https://localhost
# Or install it in your operating system
# Related: https://tech.surveypoint.com/tips/browser-trust-caddy-ssl-certs/
