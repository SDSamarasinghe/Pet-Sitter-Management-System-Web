# Base image
FROM node:22.0-alpine
 
# Set the working directory inside the container
WORKDIR /app
 
COPY package*.json ./
COPY package-lock.json .
 
# Install dependencies
RUN npm install
 
# Copy the entire project to the working directory
COPY . .
 
# Build the React app
RUN npm run build
 
# Expose a port (if needed)
EXPOSE 3000
 
# Command to start the application
CMD ["npm", "start"]