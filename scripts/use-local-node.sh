#!/usr/bin/env bash

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
node_version="v22.23.4"
platform="$(uname -s | tr '[:upper:]' '[:lower:]')"
machine="$(uname -m)"

case "$platform/$machine" in
  darwin/arm64) node_arch="darwin-arm64" ;;
  darwin/x86_64) node_arch="darwin-x64" ;;
  *)
    echo "Unsupported local Node platform: $platform/$machine" >&2
    return 1 2>/dev/null || exit 1
    ;;
esac

node_home="$repo_dir/.tools/node-$node_version-$node_arch"
if [[ ! -x "$node_home/bin/node" ]]; then
  echo "Local Node is not installed. Run ./scripts/setup-local.sh first." >&2
  return 1 2>/dev/null || exit 1
fi

export PATH="$node_home/bin:$PATH"
