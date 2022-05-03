# chat-room

NodeJS, Express &amp; Socket.io based chat room application

## To start in DEV mode

`yarn run dev`

or

`npm run dev`

## Docker buildx build

I have a custom JFrog artifactory, where I push my docker images to, please replace as you may wish

```
docker buildx build --push \
--tag webstash.jfrog.io/webstash-docker/chat-stash:latest \
--tag webstash.jfrog.io/webstash-docker/chat-stash:1.0.0 \
--platform linux/arm64,linux/amd64 .
```
