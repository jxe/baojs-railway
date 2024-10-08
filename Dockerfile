# Use the offical Bun image
FROM oven/bun:latest

# Set the Docker working directory as /usr/src/app
# Copy everything from here into Docker's /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

# Install the dependencies (Bao.js)
RUN bun install
RUN bun x prisma generate

# The port that Bao.js will listen on
EXPOSE 8080

# Run the Bao.js webserver
CMD bun run src/index.ts