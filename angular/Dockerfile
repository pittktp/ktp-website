#STAGE 1
FROM node:8 as builder

COPY ./ /angular_app

WORKDIR /angular_app

RUN npm install
RUN $(npm bin)/ng build

#STAGE 2
FROM nginx

COPY --from=builder /angular_app/dist/* /usr/share/nginx/html/

EXPOSE 80
