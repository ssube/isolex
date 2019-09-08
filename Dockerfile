FROM apextoaster/node:10.1

# install sqlite tools
RUN apt-get update \
 && apt-get install -y sqlite3 \
 && rm -rf /var/lib/apt/lists/*

# copy build output
COPY package.json /app/package.json
COPY src/schema/schema.yml /app/src/schema/schema.yml
COPY src/locale/en.yml /app/src/locale/en.yml
COPY out/ /app/out/

WORKDIR /app

# install native modules
RUN yarn install --production

ENTRYPOINT [ "/usr/bin/node", "/app/out/index.js" ]
