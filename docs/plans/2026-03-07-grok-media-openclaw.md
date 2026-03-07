# Grok Media OpenClaw Plugin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a first-version `grok-media` OpenClaw plugin that can call grok2api for image generation, image editing, image-to-video, and task status, with primary/fallback routing and explicit slash commands.

**Architecture:** Implement a config-driven OpenClaw extension under the server `extensions/` directory. The plugin will register media tools plus `/imagine`, `/edit`, `/video`, `/task` commands, route requests through a shared grok2api client with primary/fallback base URLs, and return structured payloads that OpenClaw can surface as text plus media URLs. Attachment-aware inputs will use message-provided local media paths first, then URLs.

**Tech Stack:** OpenClaw plugin SDK, TypeScript plugin extension, Node 22 runtime, grok2api HTTP endpoints, server-side deployment under 1Panel OpenClaw data directory.

---

### Task 1: Discover the runtime API surface

**Files:**
- Read: `/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/duckduckgo-search/index.ts`
- Read: `/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/search-layer-tool/index.ts`
- Read: `/app/dist/plugin-sdk/plugins/types.d.ts`
- Read: `/app/dist/plugin-sdk/auto-reply/types.d.ts`

**Step 1: Inspect plugin registration APIs**

Check how tools, commands, and hooks are registered.

**Step 2: Inspect reply payload shape and media support**

Find the supported fields for text, local media paths, media URLs, and command responses.

**Step 3: Inspect inbound media exposure**

Confirm how message media paths are exposed to commands and/or agent prompts.

**Step 4: Record constraints**

Document whether first version should rely on explicit `image_path`/`image_url` args, command context, or prompt-parsed local media paths.

### Task 2: Create a failing plugin smoke test harness

**Files:**
- Create: `/tmp/openclaw-grok-media-test.mjs`
- Create: `/tmp/openclaw-grok-media-fixtures/`
- Test: `node /tmp/openclaw-grok-media-test.mjs`

**Step 1: Write the failing test**

Create a Node script that imports the plugin module, stubs the OpenClaw plugin API, and asserts:
- `registerTool` is called for `grok_imagine`, `grok_edit_image`, `grok_image_to_video`, `grok_task_status`
- `registerCommand` is called for `imagine`, `edit`, `video`, `task`
- tool execution against a mock HTTP server routes primary then fallback correctly

**Step 2: Run test to verify it fails**

Run: `node /tmp/openclaw-grok-media-test.mjs`
Expected: FAIL because plugin does not exist yet.

**Step 3: Keep the harness simple**

Use Node built-ins only: `node:test`, `node:assert/strict`, `node:http`, dynamic `import()`.

### Task 3: Implement the first plugin skeleton

**Files:**
- Create: `/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media/openclaw.plugin.json`
- Create: `/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media/index.ts`

**Step 1: Define plugin metadata**

Add plugin id, name, description, and config schema with:
- `baseUrlPrimary`
- `baseUrlFallback`
- `timeoutMs`
- `pollIntervalMs`
- `pollTimeoutMs`
- `preferDirectFile`
- `publicBaseUrl`

**Step 2: Implement shared request helpers**

Build a minimal client that:
- normalizes URLs
- tries primary first
- retries on transport/5xx/timeout to fallback
- does not retry 4xx validation failures

**Step 3: Implement tool registration**

Register:
- `grok_imagine`
- `grok_edit_image`
- `grok_image_to_video`
- `grok_task_status`

**Step 4: Return structured payloads**

Each tool should return JSON text plus `details` with fields like:
- `status`
- `provider`
- `task_id`
- `files`
- `links`
- `preview`
- `message`

### Task 4: Implement explicit commands

**Files:**
- Modify: `/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media/index.ts`

**Step 1: Add `/imagine`**

Parse the remaining message text as prompt, call the shared imagine handler, return reply payload.

**Step 2: Add `/edit`**

Parse prompt plus optional image path/URL hints from args. If none present, return a one-line instruction asking the user to send an image or include an image path/URL.

**Step 3: Add `/video`**

Parse prompt plus optional image path/URL hints, submit the async task, and return progress text plus task id.

**Step 4: Add `/task`**

Fetch the task by id and format status for chat.

### Task 5: Add attachment-aware image resolution

**Files:**
- Modify: `/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media/index.ts`
- Test: `node /tmp/openclaw-grok-media-test.mjs`

**Step 1: Write the failing test**

Add cases for resolving:
- explicit `image_path`
- explicit `image_url`
- media path embedded in a command arg or prompt

**Step 2: Run test to verify it fails**

Run: `node /tmp/openclaw-grok-media-test.mjs`
Expected: FAIL on missing image resolution behavior.

**Step 3: Implement minimal resolver**

Support first-version sources in this order:
- `image_path`
- `image_url`
- prompt/body extracted `MediaPath:` line or local path token

**Step 4: Run test to verify it passes**

Run: `node /tmp/openclaw-grok-media-test.mjs`
Expected: PASS.

### Task 6: Deploy and reload plugin

**Files:**
- Modify: `/opt/1panel/apps/openclaw/openclaw/data/conf/openclaw.json`
- Create: `/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media/*`

**Step 1: Back up current config**

Copy `openclaw.json` before editing.

**Step 2: Enable plugin entry**

Add `grok-media` under `plugins.entries` with first-version config.

**Step 3: Restart OpenClaw container**

Run the container restart command and confirm it boots cleanly.

**Step 4: Verify plugin load**

Check logs for plugin registration or load errors.

### Task 7: Validate live behavior

**Files:**
- Test: server OpenClaw runtime and logs

**Step 1: Validate command registration**

Use OpenClaw help/command surface or logs to confirm `/imagine`, `/edit`, `/video`, `/task` are available.

**Step 2: Validate imagine path**

Run one minimal imagine request against grok2api and confirm a structured result is returned.

**Step 3: Validate fallback behavior**

Temporarily force primary failure in the smoke harness and ensure fallback works.

**Step 4: Validate edit/video missing-image handling**

Confirm the plugin returns a clear instruction when no image input is provided.

### Task 8: Document current limitations

**Files:**
- Modify: `/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media/index.ts`
- Modify: `/Users/aay/自有项目/go-react/docs/plans/2026-03-07-grok-media-openclaw.md`

**Step 1: Keep first version intentionally narrow**

Explicitly note:
- automatic natural-language tool selection may still depend on model behavior and prompting
- direct file re-upload from command context may be channel-specific
- first version returns links/structured payloads before richer inline media delivery is added

**Step 2: Define next iteration**

List follow-up items for:
- full Telegram/Web attachment bridging
- richer progress updates
- automatic post-completion media push
- image editing masks and multi-image flows
