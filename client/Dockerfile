FROM node:alpine as builder

WORKDIR '/app'

# Get our dependencies in a separate cached image
COPY ./package.json .
RUN npm install

# Now grab everything else
COPY . .

# Build our production app
RUN npm run build

# Get NGINX up and running - multi-stage Docker build
FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
