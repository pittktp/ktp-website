# A file that packages the backend into a Docker image -> used along with nginx.conf for deployment

FROM node:8-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
CMD [ "node", "index.js" ]
