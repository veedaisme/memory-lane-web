#!/bin/bash

# Exit on error
set -e

echo "Building Memory Lane Docker image..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Run the prebuild cleanup script
echo "Running prebuild cleanup..."
./prebuild-cleanup.sh

# Clean up any previous build artifacts
echo "Cleaning up previous build artifacts..."
rm -rf dist node_modules/.vite || true

# Increase Docker memory limit (if using Docker Desktop)
echo "Setting Docker resource limits..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Detected macOS, setting Docker Desktop memory limits"
    echo "Please ensure Docker Desktop has at least 4GB memory allocated in Preferences > Resources"
fi

# Set environment variable for Docker build
export DOCKER_BUILD=true

# Build with specific memory and CPU limits
echo "Building image with resource limits..."
docker build \
    --platform linux/amd64 \
    --memory=4g \
    --memory-swap=4g \
    --cpu-shares=2 \
    --build-arg DOCKER_BUILD=true \
    -t iqbaaaaalf/memorylane:latest .

# Tag the image
echo "Push image as iqbaaaaalf/memorylane:latest"
docker push iqbaaaaalf/memorylane:latest

echo "Build completed successfully!"