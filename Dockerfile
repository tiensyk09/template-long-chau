FROM node:22-slim

# Install git (required for cloning templates) and clean apt cache
RUN apt-get update && apt-get install -y git openssh-client && rm -rf /var/lib/apt/lists/*

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
