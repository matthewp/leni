.PHONY: all build serve watch dev

ROLLUP=node_modules/.bin/rollup

all: build

leni.umd.js: leni.js
	$(ROLLUP) -o $@ -c rollup.config.js -f umd -n leni leni.js

build: leni.umd.js

serve:
	http-server -p 8043

watch:
	find leni.js | entr make build

dev:
	make serve & make watch
