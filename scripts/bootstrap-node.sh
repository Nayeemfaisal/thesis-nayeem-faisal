#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
node_version="v22.23.4"
platform="$(uname -s | tr '[:upper:]' '[:lower:]')"
machine="$(uname -m)"

case "$platform/$machine" in
  darwin/arm64) node_arch="darwin-arm64" ;;
  darwin/x86_64) node_arch="darwin-x64" ;;
  *)
    echo "Automatic Node setup supports macOS on Apple Silicon or Intel. Current platform: $platform/$machine" >&2
    exit 1
    ;;
esac

tools_dir="$repo_dir/.tools"
install_dir="$tools_dir/node-$node_version-$node_arch"
archive="node-$node_version-$node_arch.tar.gz"
download_url="https://nodejs.org/dist/$node_version/$archive"

if [[ -x "$install_dir/bin/node" ]]; then
  echo "Local Node $node_version is already installed."
  exit 0
fi

mkdir -p "$tools_dir"
tmp_dir="$(mktemp -d "$tools_dir/node-download.XXXXXX")"
trap 'rm -rf "$tmp_dir"' EXIT

echo "Downloading Node $node_version for $node_arch..."
curl --fail --location --silent --show-error "$download_url" --output "$tmp_dir/$archive"
curl --fail --location --silent --show-error \
  "https://nodejs.org/dist/$node_version/SHASUMS256.txt" \
  --output "$tmp_dir/SHASUMS256.txt"

expected_line="$(grep "  $archive$" "$tmp_dir/SHASUMS256.txt")"
if [[ -z "$expected_line" ]]; then
  echo "Could not find the archive checksum in Node's official checksum file." >&2
  exit 1
fi

(
  cd "$tmp_dir"
  printf '%s\n' "$expected_line" | shasum -a 256 --check
)

tar -xzf "$tmp_dir/$archive" -C "$tools_dir"
echo "Installed local Node $node_version."
