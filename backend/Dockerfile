# Dockerfile - Backend

# Base image
FROM node:22

# Define the working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3001

# Default command
CMD ["node", "src/server.js"]
