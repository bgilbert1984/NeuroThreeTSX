#!/bin/bash

# Create test directory structure
echo "Creating test directory structure..."

# Create test directory if it doesn't exist
mkdir -p test

# Create test/__tests__ directory for component tests
mkdir -p test/__tests__

# Create test/__tests__/components directory
mkdir -p test/__tests__/components

# Create test/__tests__/pages directory
mkdir -p test/__tests__/pages

echo "Directory structure created successfully"
