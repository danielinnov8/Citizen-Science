---
name: Long-running seeds & the bash-tool hang
description: How to run long resumable data-seed scripts without the bash tool itself hanging at exit code -1.
---

# Long-running seeds & the bash-tool hang

Running a long Node/tsx seed (e.g. ~1000 network fetches) via the bash tool can
make the **tool itself** return exit code `-1` with NO output, even when the
script is actually working. Two compounding causes:

1. `pnpm ... run seed | tail -N` buffers — `tail` shows nothing until the
   process exits, so a still-running script looks like a silent hang.
2. An orphaned node grandchild (spawned by pnpm/tsx) can keep the stdout pipe fd
   open after `timeout` kills its direct child, so bash never sees EOF and the
   tool waits until its own ceiling, returning `-1`.

**Reliable pattern** for a foreground, time-bounded, resumable pass:

```
cd <pkg> && timeout -s KILL 110 node --import tsx ./src/seed-x.ts [args] \
  > /tmp/seed.log 2>&1 < /dev/null; echo "exit=$?"; tail -3 /tmp/seed.log
```

- `-s KILL` force-kills the whole process (SIGTERM is often ignored).
- redirect to a file + `< /dev/null` detaches stdio so the tool never blocks on
  an orphan holding the pipe.
- read progress from the log file (separately if needed).

**Why:** background procs die between bash calls (see that memory), so you can't
nohup a seed and poll it. Instead run repeated foreground passes under ~110s.
This only works if the seed is **idempotent and resumable**: each pass skips
already-done rows cheaply and only does expensive work (network/portrait fetch)
for new rows, so killing mid-run is safe and N passes converge.

**How to apply:** any bulk import/seed over a few hundred external calls. Make
the script idempotent first (key by a stable id/slug, load existing keys upfront,
skip-or-cheap-update on collision), then drive it with timed SIGKILL passes.
