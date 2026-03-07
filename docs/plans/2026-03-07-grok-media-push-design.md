# Grok Media Push Layer Design

**Scope**
- Refactor `grok-media` proactive result delivery into a channel-agnostic push layer.
- Keep Telegram as the only active adapter for now because it is the only enabled chat channel on the server.
- Improve proactive video result messages with clearer status text, task id, and prompt summary.

**Current State**
- `grok-media` can launch image/video jobs and track in-memory video tasks.
- Telegram proactive push already exists in a direct, embedded form inside the video task consumer.
- OpenClaw server currently has only the `telegram` channel enabled.

**Design**
1. Add a normalized `pushRoute` object captured when a `/video` command starts.
2. Add a generic `pushMediaResult(runtime, taskRecord, payload)` dispatcher.
3. Move Telegram-specific logic into `pushTelegramResult(...)`.
4. Keep a small adapter map so future channels can be added without changing task-consumer logic.
5. Improve outbound text formatting for success and failure states.

**Push Payload Shape**
- `kind`: `video_completed` or `video_failed`
- `taskId`
- `prompt`
- `mediaUrl`
- `message`
- `progress`

**Formatting Rules**
- Success text:
  - `视频生成完成`
  - `任务: <task_id>`
  - `提示词: <trimmed prompt>`
- Failure text:
  - `视频生成失败`
  - `任务: <task_id>`
  - `原因: <message>`
  - `可重试: /task <task_id>` when a task record still exists
- Prompt summary should be trimmed to avoid flooding chat.

**Channel Strategy**
- Telegram: send via `runtime.channel.telegram.sendMessageTelegram(...)` with `mediaUrl` when available.
- Other channels: do not implement transport now, but keep the generic dispatcher ready.
- Unsupported channels should no-op cleanly and keep task state intact.

**Testing**
- Extend the local Node smoke harness.
- Verify plugin still registers hooks/tools/commands.
- Verify fallback request behavior is unchanged.
- Verify `/video` completion triggers Telegram proactive send through the generic push layer.
- Verify improved success copy is included.

**Out of Scope**
- Persisting tasks across OpenClaw restarts.
- Full multi-channel runtime verification beyond Telegram.
- Thumbnail-specific delivery or richer inline card layouts.
