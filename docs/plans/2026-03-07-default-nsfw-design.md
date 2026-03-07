# Default NSFW Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make NSFW enabled by default for OpenClaw image/video generation and for grok2api image/video endpoints when callers do not explicitly specify a value, while preserving the ability to opt out with `nsfw=false`.

**Architecture:** Apply the default in two layers. In the OpenClaw grok-media plugin, send `nsfw: true` by default for image/video commands and tools unless the caller explicitly provides a value. In grok2api, keep image generation defaulting through config and extend video request/session flow with an explicit `nsfw` field that defaults to `true` when omitted, then prefer `nsfw`-tagged tokens for video requests while falling back to normal routing if none are available.

**Tech Stack:** TypeScript plugin, Python FastAPI API handlers, existing token manager/pool classes, Node test runner, pytest-style unit tests if present.

---

### Task 1: Add failing tests for OpenClaw NSFW defaults

**Files:**
- Modify: `ops/openclaw/grok-media/test.mjs`

**Step 1: Write the failing test**

Add tests that verify:
- `grok_imagine` sends `nsfw: true` by default.
- `/video` sends `nsfw: true` by default.
- `/textvideo` sends `nsfw: true` by default.
- Explicit `nsfw: false` remains possible.

**Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern='nsfw' ops/openclaw/grok-media/test.mjs`
Expected: FAIL because current plugin does not forward `nsfw`.

**Step 3: Write minimal implementation**

Update the plugin request bodies to include default `nsfw: true`, with explicit override support.

**Step 4: Run test to verify it passes**

Run the same `node --test` command and confirm PASS.

**Step 5: Commit**

```bash
git add ops/openclaw/grok-media/index.ts ops/openclaw/grok-media/test.mjs
```

### Task 2: Add failing tests for grok2api default behavior

**Files:**
- Modify: `/Users/aay/自有项目/grok2api/app/api/v1/image.py`
- Modify: `/Users/aay/自有项目/grok2api/app/api/v1/public_api/video.py`
- Add or modify tests under `/Users/aay/自有项目/grok2api/tests`

**Step 1: Write the failing test**

Add tests that verify:
- OpenAI-compatible `/v1/images/generations` passes `enable_nsfw=True` by default and respects explicit `False`.
- Public video start/session logic stores `nsfw=True` by default when omitted.
- Video token routing prefers `nsfw`-tagged tokens when `nsfw=True`.

**Step 2: Run test to verify it fails**

Run the narrow grok2api test command for the new tests.
Expected: FAIL because request/default propagation is missing for image/video.

**Step 3: Write minimal implementation**

- Add `nsfw` to image request model and pass it through.
- Add `nsfw` to public video request/session model.
- Extend token selection to prefer `nsfw`-tagged tokens for video when enabled, with fallback.

**Step 4: Run test to verify it passes**

Run the same narrow test command and confirm PASS.

**Step 5: Commit**

```bash
git add /Users/aay/自有项目/grok2api/app/api/v1/image.py /Users/aay/自有项目/grok2api/app/api/v1/public_api/video.py /Users/aay/自有项目/grok2api/app/services/token/pool.py /Users/aay/自有项目/grok2api/app/services/token/manager.py
```

### Task 3: Deploy and verify

**Files:**
- Deploy OpenClaw plugin to server
- Deploy grok2api service to server

**Step 1: Run focused verification**

Run local targeted tests for both codebases.

**Step 2: Deploy**

- Deploy OpenClaw plugin with existing deploy script.
- Deploy grok2api with your existing server release flow.

**Step 3: Verify runtime config/behavior**

Confirm the running server code includes `nsfw` in image/video request handling and that OpenClaw command requests now include default NSFW.

**Step 4: Smoke test**

Expected examples:
- `/textvideo 雨夜城市` should default to NSFW-on path.
- `/video 让人物转头` should default to NSFW-on path.
- Explicit future opt-out remains possible via request/API override.

**Step 5: Commit**

```bash
git add docs/plans/2026-03-07-default-nsfw-design.md
```
