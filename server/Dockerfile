FROM node:alpine

WORKDIR '/app'

# Get our dependencies in a separate cached image
COPY ./package.json .
RUN npm install

# Now grab everything else
COPY . .

# Start everything up in production monitor mode
CMD ["npm", "run", "start"]
