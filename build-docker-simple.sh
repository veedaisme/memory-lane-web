#!/bin/bash

# Exit on error
set -e

echo "Building Memory Lane Docker image (simplified)..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Clean up any previous build artifacts
echo "Cleaning up previous build artifacts..."
rm -rf dist node_modules/.vite || true

# Build with debugging enabled
echo "Building image with debugging..."
docker build \
    --platform linux/amd64 \
    --no-cache \
    --progress=plain \
    -t iqbaaaaalf/memorylane:latest .

echo "Build completed successfully!"
echo "To push the image: docker push iqbaaaaalf/memorylane:latest" 