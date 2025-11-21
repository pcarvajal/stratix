#!/bin/bash

# Script to unpublish old Stratix packages from npm registry
# This removes packages that have been renamed or are no longer part of the project

echo "Starting unpublish process for old Stratix packages..."
echo ""

# Check if logged in to npm
if ! npm whoami &> /dev/null; then
  echo "ERROR: You are not logged in to npm"
  echo "Please run 'npm login' first"
  exit 1
fi

echo "Logged in as: $(npm whoami)"
echo ""

# Array of packages to unpublish
packages=(
  "create-stratix"
  "@stratix/abstractions"
  "@stratix/ext-ai-agents-anthropic"
  "@stratix/ext-ai-agents-openai"
  "@stratix/ext-mongodb"
  "@stratix/ext-opentelemetry"
  "@stratix/ext-postgres"
  "@stratix/ext-rabbitmq"
  "@stratix/ext-redis"
  "@stratix/ext-secrets"
  "@stratix/impl-ai-agents"
  "@stratix/impl-cqrs-inmemory"
  "@stratix/impl-di-awilix"
  "@stratix/impl-logger-console"
  "@stratix/primitives"
  "@stratix/runtime"
  "@stratix/testing"
  "@stratix/ext-auth"
  "@stratix/ext-errors"
  "@stratix/ext-http-fastify"
  "@stratix/ext-mappers"
  "@stratix/ext-migrations"
  "@stratix/ext-validation-zod"
)

# Counter for tracking
total=${#packages[@]}
success=0
failed=0
skipped=0

echo "Total packages to unpublish: $total"
echo ""

# Loop through each package
for package in "${packages[@]}"; do
  echo "Processing: $package"

  # Check if package exists on npm
  if npm view "$package" version &> /dev/null; then
    echo "  Found on npm, attempting to unpublish..."

    # Try to unpublish (capture output and error code)
    if unpublish_output=$(npm unpublish "$package" --force 2>&1); then
      unpublish_success=true
    else
      unpublish_success=false
      echo "  Command output: $unpublish_output"
    fi

    # Wait a moment for npm registry to update
    sleep 2

    # Verify if package was actually unpublished
    if npm view "$package" version &> /dev/null; then
      echo "  ✗ Failed to unpublish: $package (package still exists on npm)"
      ((failed++))
    else
      echo "  ✓ Successfully unpublished: $package (verified - package no longer exists)"
      ((success++))
    fi
  else
    echo "  ⊘ Package not found on npm (already unpublished or never published): $package"
    ((skipped++))
  fi

  echo ""
done

# Summary
echo "================================"
echo "Unpublish Summary"
echo "================================"
echo "Total packages: $total"
echo "Successfully unpublished: $success"
echo "Failed: $failed"
echo "Skipped (not found): $skipped"
echo "================================"

if [ $failed -gt 0 ]; then
  echo ""
  echo "WARNING: Some packages failed to unpublish."
  echo "This might be due to:"
  echo "  - Insufficient permissions"
  echo "  - Not being logged in to npm"
  echo "  - Package protection/restrictions"
  echo ""
  echo "Run 'npm login' if needed and try again."
  exit 1
fi

echo ""
echo "Unpublish process completed successfully!"
