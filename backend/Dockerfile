# Node.js Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies
RUN yarn install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 8001

# Start command
CMD ["node", "server.js"]
