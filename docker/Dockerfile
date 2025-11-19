FROM node:20-slim

# Install Java
RUN apt-get update && \
    apt-get install -y default-jdk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create a working directory
WORKDIR /app

# Default command
CMD ["echo", "CodeArena Sandbox Ready"]
