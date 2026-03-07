# Clean Codex Scripts Merge Design (2026-03-03)

## Context
We have two similar scripts:
- `/Users/aay/Downloads/clean_codex/clean_codex_accounts.py` (older, includes usage/threshold features)
- `/Users/aay/Downloads/clean_codex_accounts/clean_codex_accounts.py` (newer, adds HAR parsing, local-dir mode, safer delete)

We want a single merged script that keeps the newer capabilities while reintroducing older usage/threshold and manual auth_index delete features.

## Goals
- Preserve the newer script as the base and reintroduce missing legacy features.
- Keep a mixed UX: interactive menu by default, CLI flags for automation.
- Support both remote management mode and local-dir mode.
- Prefer local deletion when a local path exists.

## Non-Goals
- Large refactor into multiple modules.
- Changing the management API behavior or server-side APIs.

## Proposed Approach (Chosen: A)
Use `/Users/aay/Downloads/clean_codex_accounts/clean_codex_accounts.py` as the base and merge back the following capabilities from the older script:
- Usage metrics extraction and export (used_percent, window, reset, etc.).
- Delete by used_percent threshold.
- Manual delete by auth_index.

Keep all newer features:
- HAR parsing for token/base_url/UA/account id.
- Local directory mode and direct token probing.
- Safer delete logic (local path delete first).

## UX and CLI
Default behavior: show interactive menu unless arguments indicate a non-interactive operation.
Menu items:
1. Check 401 and export
2. Check 401 and delete
3. Delete by output file
4. Export usage (used_percent)
5. Delete by used_percent threshold
6. Delete by auth_index (manual input)
0. Exit

CLI flags:
- Keep existing newer flags (har, local-dir, delete, delete-from-output, yes, proxy)
- Add output-usage for usage export file

Mode constraints:
- Usage and threshold actions require remote management mode. If local-dir is set, show a clear warning and return to menu.

## Data Flow and Rules
- Remote mode: list via /v0/management/auth-files, probe via /v0/management/api-call.
- Local mode: load JSON files from local_dir, probe directly via access_token/id_token.
- Delete priority: if local_path exists, delete local file only; otherwise delete remote record.

## Error Handling
- Missing token in remote mode prompts for token and exits if not provided.
- HAR parsing failures are surfaced with an actionable message.
- Local mode missing access_token/id_token is reported per item.

## Testing/Verification
- Remote mode: run with --har or --token and perform a check-only run.
- Local mode: run with --local-dir and verify 401 output creation.
- Menu flows: verify usage export and threshold delete are blocked in local mode.

## Files to Change
- `/Users/aay/Downloads/clean_codex_accounts/clean_codex_accounts.py` (merge features in)
- `/Users/aay/Downloads/clean_codex_accounts/config.json` (add output-usage default if needed)

## Rollout
- Run a dry check (no deletes) in remote mode.
- Confirm output files and logs.
- Enable delete operations after verification.
