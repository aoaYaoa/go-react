# OpenClaw Media Command Bypass Design

**Goal:** Make `/imagine`, `/edit`, `/video`, `/textvideo`, and `/t2v` bypass OpenClaw chat-layer refusal so only the grok-media plugin command result is sent.

**Architecture:** Keep the change local to the `grok-media` plugin. Detect these five slash commands during `message:preprocessed`, record a short-lived pending media-command turn keyed by channel/account, and force `before_prompt_build` to return `[[silent]]` for that turn so the main chat agent does not generate a refusal or advisory response. Keep `message_sending` cancellation as a second safety net for stray text replies, but do not affect normal non-command chat.

**Scope:** Only the five slash commands are bypassed. Normal text conversations and non-media commands keep existing behavior.

**Tests:** Add focused Node tests that verify the pending turn is recorded for media slash commands, `before_prompt_build` silences the chat layer once, and `message_sending` cancels stray non-plugin replies while allowing known grok-media replies through.
