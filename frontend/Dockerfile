# Dockerfile - Frontend 
FROM node:22

# Set working directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose Vite development server port
EXPOSE 5173

# Set environment variable (can be overridden via .env)
ENV VITE_API_URL=http://backend:3001

# Command to start the Vite development server
CMD ["npm", "run", "dev", "--", "--host"]
