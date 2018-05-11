FROM apextoaster/node:10.1

# copy native modules
COPY node_modules/sqlite3 /app/node_modules/sqlite3
COPY node_modules/uws /app/node_modules/uws

# copy build output
COPY out/ /app/out

WORKDIR /app

ENTRYPOINT [ "/usr/bin/node", "/app/out/main-bundle.js" ]
