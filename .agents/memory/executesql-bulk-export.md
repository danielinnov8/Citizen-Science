---
name: executeSql bulk export gotcha
description: Exporting SQL/JSON rows via executeSql corrupts on commas (CSV-ish output) and the durable sandbox lacks Buffer/TextDecoder — hex-encode in SQL, decode in an impure function.
---

`executeSql` results come back as CSV-ish text: any field containing commas is quote-wrapped with doubled inner quotes, so emitting SQL statements or JSON via `SELECT format(...)` gets mangled and can't be line-parsed reliably.

**Why:** hit this exporting outreach contact_info JSON as UPDATE statements — naive line parse yielded 0 rows; `Buffer` and `TextDecoder` are also both undefined in the CodeExecution durable scope.

**How to apply:** have Postgres hex-encode each row (`encode(convert_to(expr, 'UTF8'), 'hex')` — no line breaks, unlike base64 which wraps at 76 chars), collect the hex lines, then decode with `Buffer.from(hex,'hex')` inside a `"use impure"` function (node imports allowed there). Page large exports (e.g. 50 rows/call) to avoid output truncation.
