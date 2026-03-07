# OpenClaw Video Command Params Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add CLI-style parameter parsing for `/video` and `/textvideo`, keep `/t2v` as a hidden compatibility alias, and update the Telegram command menu to show the clearer command names/descriptions.

**Architecture:** Keep the current Grok Media plugin structure and add one shared command argument parser that extracts prompt text plus `ratio/len/res/preset` options. Route `/video` through the existing image-to-video flow, route `/textvideo` and `/t2v` through the text-to-video flow, and leave the tool-level API unchanged except for using the parsed values. Telegram menu changes remain outside native commands and continue to use the Bot API registration path.

**Tech Stack:** TypeScript plugin file, Node test runner, Telegram Bot API, existing deploy script.

---

### Task 1: Add failing tests for alias and parameter parsing

**Files:**
- Modify: `ops/openclaw/grok-media/test.mjs`

**Step 1: Write the failing test**

Add tests that verify:
- `/textvideo` is a registered command while `/t2v` still exists as a hidden alias.
- `/textvideo 雨夜城市 --ratio 16:9 --len 10 --res 720p --preset spicy` sends the parsed values to `/v1/public/video/start`.
- `/video 让人物转头 --ratio 9:16 --len 6 --preset fun` keeps using image-to-video and sends parsed values.

**Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern='plugin registers tools and commands|textvideo|video command parses inline options' ops/openclaw/grok-media/test.mjs`
Expected: FAIL because `textvideo` is not yet registered and inline options are not yet parsed.

**Step 3: Write minimal implementation**

Implement only enough parsing and alias registration to satisfy the new tests.

**Step 4: Run test to verify it passes**

Run: `node --test --test-name-pattern='plugin registers tools and commands|textvideo|video command parses inline options' ops/openclaw/grok-media/test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add ops/openclaw/grok-media/test.mjs ops/openclaw/grok-media/index.ts
```

### Task 2: Wire parsed params into the command handlers

**Files:**
- Modify: `ops/openclaw/grok-media/index.ts`

**Step 1: Write the failing test**

Reuse Task 1 tests so they cover real handler behavior.

**Step 2: Run test to verify it fails**

Run the same targeted `node --test` command and confirm the failure is due to missing parsing/alias behavior.

**Step 3: Write minimal implementation**

Add:
- shared parser for `--ratio`, `--len`, `--res`, `--preset`
- `/textvideo` command handler
- hidden `/t2v` alias handler pointing to the same text-to-video path
- parsed params forwarded into `handleVideo` / `handleTextToVideo`

**Step 4: Run test to verify it passes**

Run the same targeted `node --test` command and confirm it passes.

**Step 5: Commit**

```bash
git add ops/openclaw/grok-media/index.ts ops/openclaw/grok-media/test.mjs
```

### Task 3: Update plugin metadata and Telegram menu text

**Files:**
- Modify: `ops/openclaw/grok-media/openclaw.plugin.json`
- Remote update only: Telegram menu via Bot API on server

**Step 1: Write the failing test**

Use a registration assertion in `ops/openclaw/grok-media/test.mjs` for the visible command list.

**Step 2: Run test to verify it fails**

Run the targeted `node --test` command and confirm the command list is wrong before implementation.

**Step 3: Write minimal implementation**

- Update plugin description/help text if needed.
- Set menu items to:
  - `/imagine` `生成图片`
  - `/edit` `编辑当前图片`
  - `/video` `当前图生成视频`
  - `/textvideo` `文字生成新视频`
  - `/task` `查询任务进度`

**Step 4: Run test to verify it passes**

Run the targeted command tests locally, then query Telegram `getMyCommands` on the server.
Expected: menu includes `/textvideo` and does not show `/t2v`.

**Step 5: Commit**

```bash
git add ops/openclaw/grok-media/openclaw.plugin.json
```

### Task 4: Verify and deploy

**Files:**
- Deploy via: `ops/openclaw/grok-media/deploy.sh`

**Step 1: Run focused verification**

Run:
```bash
node --test --test-name-pattern='plugin registers tools and commands|textvideo|video command parses inline options|video command proactively pushes result to telegram when task completes' ops/openclaw/grok-media/test.mjs
```

**Step 2: Deploy**

Run:
```bash
./ops/openclaw/grok-media/deploy.sh
```

**Step 3: Verify remote menu**

Run server-side Telegram `getMyCommands` query and confirm visible commands.

**Step 4: Smoke test expectation**

Expected examples:
- `/textvideo 雨夜城市 --ratio 16:9 --len 10 --res 720p --preset spicy`
- `/video 让人物转头 --ratio 9:16 --len 6 --preset fun`

**Step 5: Commit**

```bash
git add docs/plans/2026-03-07-openclaw-video-command-params.md
```
