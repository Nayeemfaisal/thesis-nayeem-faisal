#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="$repo_dir/academic-source/tha-template"
image="${THESIS_TEX_IMAGE:-texlive/texlive:latest}"

docker_socket="$HOME/.docker/run/docker.sock"
if [[ ! -S "$docker_socket" ]] || ! curl --max-time 5 --silent --unix-socket "$docker_socket" http://localhost/_ping | grep -q '^OK$'; then
  echo "Docker Desktop is not running." >&2
  exit 1
fi

docker run --rm \
  --volume "$source_dir:/work" \
  --workdir /work \
  "$image" \
  make clean
