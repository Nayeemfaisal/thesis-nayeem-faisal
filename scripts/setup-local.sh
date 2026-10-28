#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$repo_dir/scripts/bootstrap-node.sh"
source "$repo_dir/scripts/use-local-node.sh"

echo "Installing the website dependencies..."
cd "$repo_dir/site"
npm ci

echo
echo "Local setup complete."
echo "Run the website with: ./scripts/run-site.sh"
echo "Then open: http://localhost:3000/thesis"
echo "For the THA LaTeX preview, start Docker Desktop and run: ./scripts/build-thesis-docker.sh"
