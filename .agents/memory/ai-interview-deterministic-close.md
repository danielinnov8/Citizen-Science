---
name: AI interview deterministic close
description: Structured multi-turn AI flows (interviews, wizards) need server-counted turn limits, not model self-counting.
---

The rule: when an LLM drives a fixed-length conversational flow that must end with a control marker (e.g. `[[complete]]`), the server must count the member's answers itself and inject an explicit forced-close instruction into the final turn. Prompt rules like "the interview is 4 questions, count your own questions" are not reliably obeyed — the model keeps asking follow-ups and the client never sees the end marker.

**Why:** In live testing the onboarding guide sailed past its 4-question budget and never emitted `[[complete]]`, which would strand the member with no exit.

**How to apply:**
- Server: count `role === "user"` messages in the request; at the limit, append a "(This was the final answer. Do NOT ask another question. Close now and end with [[complete]].)" note to the last user message.
- Client: belt-and-braces — also treat the flow as done once the answer count reaches the limit, even if the marker never arrives, and always offer a skip affordance.
- Marker parsing on streamed text must hold back a trailing partial `[[` so markers split across SSE chunks never flash on screen.
