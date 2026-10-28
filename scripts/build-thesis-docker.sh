#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="$repo_dir/academic-source/tha-template"
image="${THESIS_TEX_IMAGE:-texlive/texlive:latest}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install or open Docker Desktop, then run this task again." >&2
  exit 1
fi

docker_socket="$HOME/.docker/run/docker.sock"
if [[ ! -S "$docker_socket" ]] || ! curl --max-time 5 --silent --unix-socket "$docker_socket" http://localhost/_ping | grep -q '^OK$'; then
  echo "Docker Desktop is not running. Open Docker Desktop, wait until it is ready, then run this task again." >&2
  exit 1
fi

docker run --rm \
  --volume "$source_dir:/work" \
  --workdir /work \
  "$image" \
  make

echo "Created $source_dir/Nayeem-Faisal-THA-Workspace.pdf"
