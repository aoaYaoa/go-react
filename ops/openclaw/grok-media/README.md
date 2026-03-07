# grok-media

OpenClaw plugin for `grok2api` image generation, image editing, image-to-video, and task status.

## Files
- `index.ts`: deployed plugin source used by OpenClaw
- `test.mjs`: smoke harness using only Node built-ins
- `openclaw.plugin.json`: plugin metadata and config schema

## Local verification
Run from the repository root:

```bash
node ops/openclaw/grok-media/test.mjs
```

The smoke suite covers:
- tool and command registration
- primary -> fallback HTTP routing
- cached media reuse for `/edit`
- proactive Telegram push for `/video`
- regression for preferring `mp4` over `poster` image when parsing video HTML SSE payloads

## Server paths
Current server deployment targets:
- plugin source: `/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media/index.ts`
- plugin manifest: `/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media/openclaw.plugin.json`
- OpenClaw config: `/opt/1panel/apps/openclaw/openclaw/data/conf/openclaw.json`
- container: `1Panel-openclaw-HftU`

## Typical deploy steps
Upload the verified repo copies, then restart OpenClaw:

```bash
ssh -p 2222 root@194.127.193.199 'cat > /opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media/index.ts' < ops/openclaw/grok-media/index.ts
ssh -p 2222 root@194.127.193.199 'cat > /opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media/openclaw.plugin.json' < ops/openclaw/grok-media/openclaw.plugin.json
ssh -p 2222 root@194.127.193.199 'docker restart 1Panel-openclaw-HftU'
```

Then verify recent logs:

```bash
ssh -p 2222 root@194.127.193.199 'docker logs --since 20s 1Panel-openclaw-HftU 2>&1 | tail -n 120'
```

## Notes
- This repo copy mirrors the currently verified server behavior.
- Unsupported push channels safely no-op today.
- Telegram is the only verified proactive push adapter at the moment.


## Real /edit verification
Server-side verification script:
- `/Users/aay/自有项目/go-react/ops/openclaw/grok-media/verify-edit-server.mjs`

Upload and run it on the server:

```bash
ssh -p 2222 root@194.127.193.199 'cat > /tmp/verify-edit-server.mjs' < ops/openclaw/grok-media/verify-edit-server.mjs
ssh -p 2222 root@194.127.193.199 'node /tmp/verify-edit-server.mjs'
```

What it does:
- reads server OpenClaw config from `/opt/1panel/apps/openclaw/openclaw/data/conf/openclaw.json`
- loads deployed `grok-media` plugin source from the server
- sends one real `handleEdit(...)` request with a public image URL
- sends the edited result to the configured Telegram allowlist chat
- prints staged JSON logs for `start`, `edit-result`, and `telegram-result`


## Persistent edit memory
The plugin now persists recent `/edit` session context so follow-up edits can continue after a restart.

Default server state file:
- `/opt/1panel/apps/openclaw/openclaw/data/workspace/grok-media/state.json`

You can override it with plugin config field `stateFilePath`.
