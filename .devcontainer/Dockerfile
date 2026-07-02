FROM node:22-bookworm-slim

WORKDIR /workspace

# Pre-create the node_modules mount point owned by the unprivileged `node`
# user so the named volume inherits that ownership on first mount, keeping
# writes consistent whether the container runs via plain `docker compose up`
# or via the devcontainer's `remoteUser: node`.
RUN mkdir -p /workspace/node_modules && chown -R node:node /workspace
USER node

EXPOSE 5173

CMD ["sleep", "infinity"]
