ROLLUP=node_modules/.bin/rollup

all: build
.PHONY: all

leni.umd.js: leni.js
	$(ROLLUP) -o $@ -c rollup.config.js -f umd -n leni leni.js

build: leni.umd.js
.PHONY: build

serve:
	http-server -p 8043
.PHONY: serve

watch:
	find leni.js | entr make build
.PHONY: watch

dev:
	make serve & make watch
.PHONY: dev
