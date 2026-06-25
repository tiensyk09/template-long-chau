FROM node:22-alpine

# Install git (required for cloning templates)
RUN apk add --no-cache git openssh-client

WORKDIR /app

# Copy dependency configs
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Expose the server port
EXPOSE 3000

# Default environment variables
ENV PORT=3000

# Start Express server
CMD ["node", "server.js"]
