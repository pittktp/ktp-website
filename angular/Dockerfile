#STAGE 1
FROM node:8 as builder

COPY ./ /angular_app

WORKDIR /angular_app

RUN npm install
RUN $(npm bin)/ng build


#STAGE 2
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir /etc/letsencrypt
COPY letsencrypt/live/pitt-kappathetapi.com/fullchain.pem /etc/letsencrypt
COPY letsencrypt/live/pitt-kappathetapi.com/privkey.pem /etc/letsencrypt
COPY --from=builder /angular_app/dist/* /usr/share/nginx/html/
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
