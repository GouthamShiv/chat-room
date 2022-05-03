FROM node:alpine3.15

WORKDIR /opt/app

RUN mkdir -p /opt/app/node_modules \
    && chown -R node:node /opt/app

ADD . ./

RUN yarn \
    && yarn cache clean

CMD [ "yarn", "start" ]

EXPOSE 3030