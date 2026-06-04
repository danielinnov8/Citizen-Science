---
name: Background processes don't survive across bash tool calls
description: nohup/setsid/disown all get torn down; use foreground timeout-bounded batches.
---
Long-running background jobs started in the `bash` tool (even with `nohup ... &`, `setsid`, or `disown`, output redirected to a file, stdin from /dev/null) are KILLED shortly after the tool call returns / when the next call starts. They cannot be relied on to keep running between turns.

**How to apply:** For long jobs that must make steady progress (e.g. a rate-limited seed), run them in the FOREGROUND wrapped in `timeout <~113>` so they fit inside the bash tool's 120s cap, and make the job idempotent so repeated invocations resume where they left off. Write logs to a file AND tail it in the SAME call — piping through grep/tail loses buffered output when timeout SIGTERMs the process.
