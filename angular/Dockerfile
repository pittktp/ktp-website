# A file that packages the frontend into a Docker image to be run as a container in AWS -> used for deployment
# Also packages nginx using the nginx.conf file which is used as the webserver for our website into a Docker image to be run as a container -> used for deployment

#STAGE 1 - the frontend Angular image
FROM node:8 as builder
COPY ./ /angular_app
WORKDIR /angular_app
RUN npm install
RUN $(npm bin)/ng build


#STAGE 2 - the nginx webserver image
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /angular_app/dist/* /usr/share/nginx/html/
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
