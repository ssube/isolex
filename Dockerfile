FROM apextoaster/node:10.1

# copy build output
COPY package.json /app/package.json
COPY out/ /app/out/

WORKDIR /app

# install native modules
RUN yarn

ENTRYPOINT [ "/usr/bin/node", "/app/out/main-bundle.js" ]
