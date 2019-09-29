FROM apextoaster/node:11.15

# install sqlite tools
RUN apt-get update \
 && apt-get install -y sqlite3 \
 && rm -rf /var/lib/apt/lists/*

# copy build output
COPY package.json yarn.lock /app/
COPY out/vender.js /app/out/
COPY out/index.js out/main.js /app/out/

WORKDIR /app

# install native modules
RUN yarn install --production

ENTRYPOINT [ "/usr/bin/node", "/app/out/index.js" ]
