FROM node:22-bookworm-slim

# Native build tooling required to compile native npm dependencies (e.g. esbuild's
# platform binary) when no prebuilt package matches the container's platform/arch.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Pre-create the node_modules and .git mount points owned by the unprivileged
# `node` user so the named/anonymous volumes inherit that ownership on first
# mount, keeping writes consistent whether the container runs via plain
# `docker compose up` or via the devcontainer's `remoteUser: node`.
RUN mkdir -p /workspace/node_modules /workspace/.git \
    && chown node:node /workspace /workspace/node_modules /workspace/.git
USER node

EXPOSE 5173

# docker-compose.yml's `command:` is the single source of truth for how the dev
# server actually starts; this CMD only matters if the image is ever run
# standalone (no compose), so it stays a harmless no-op rather than something
# that would crash without the bind-mounted source/deps compose provides.
CMD ["sleep", "infinity"]
