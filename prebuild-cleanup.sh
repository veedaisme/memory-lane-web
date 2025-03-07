#!/bin/bash

# Exit on error
set -e

echo "Cleaning up before build..."

# Remove node_modules and reinstall with production dependencies only
if [ -d "node_modules" ]; then
  echo "Removing node_modules..."
  rm -rf node_modules
fi

# Remove build artifacts
echo "Removing build artifacts..."
rm -rf dist .cache .vite

# Remove any temporary files
echo "Removing temporary files..."
find . -name "*.log" -type f -delete
find . -name "*.tmp" -type f -delete
find . -name ".DS_Store" -type f -delete

echo "Cleanup completed successfully!" 