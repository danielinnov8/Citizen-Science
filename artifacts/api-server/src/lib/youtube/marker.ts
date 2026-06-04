// The copilot signals "a video on this topic would help" with a hidden marker
// of the form [[video?:search terms]]. This marker must NEVER reach the user —
// it is stripped from the streamed text server-side. Because the SSE text
// arrives in arbitrary chunks, a marker can be split across chunk boundaries,
// so we buffer just enough of the tail to detect a partial marker before
// flushing the safe-to-emit prefix.

const MARKER_PREFIX = "[[video?:";
const COMPLETE_MARKER_RE = /\[\[video\?:([^\]]*?)\]\]/g;

export class VideoMarkerStripper {
  private buffer = "";
  readonly terms: string[] = [];

  // Append a raw text chunk and return only the portion that is safe to emit
  // to the user now (i.e. cannot be part of an in-progress marker).
  push(text: string): string {
    this.buffer += text;
    return this.extract(false);
  }

  // Flush any remaining buffered text once the stream is complete. Drops a
  // trailing unclosed marker (malformed) but records its terms.
  flush(): string {
    return this.extract(true);
  }

  private extract(final: boolean): string {
    // 1. Remove every complete marker, capturing its search terms.
    this.buffer = this.buffer.replace(COMPLETE_MARKER_RE, (_m, terms: string) => {
      const t = terms.trim();
      if (t) this.terms.push(t);
      return "";
    });

    if (final) {
      // Drop a trailing unclosed marker so it is never shown as raw text.
      const openIdx = this.buffer.lastIndexOf(MARKER_PREFIX);
      if (openIdx !== -1 && this.buffer.indexOf("]]", openIdx) === -1) {
        const partial = this.buffer.slice(openIdx + MARKER_PREFIX.length).trim();
        if (partial) this.terms.push(partial);
        this.buffer = this.buffer.slice(0, openIdx);
      }
      const out = this.buffer;
      this.buffer = "";
      return out;
    }

    // 2. Decide how much of the tail to hold back.
    let holdFrom = this.buffer.length;

    // An opened-but-unclosed marker: hold from its start until `]]` arrives.
    const openIdx = this.buffer.lastIndexOf(MARKER_PREFIX);
    if (openIdx !== -1 && this.buffer.indexOf("]]", openIdx) === -1) {
      holdFrom = openIdx;
    } else {
      // A trailing fragment that could still grow into the marker prefix
      // (e.g. "[", "[[", "[[vid"). Hold the longest such suffix.
      const maxK = Math.min(this.buffer.length, MARKER_PREFIX.length - 1);
      for (let k = maxK; k > 0; k--) {
        if (MARKER_PREFIX.startsWith(this.buffer.slice(this.buffer.length - k))) {
          holdFrom = this.buffer.length - k;
          break;
        }
      }
    }

    const out = this.buffer.slice(0, holdFrom);
    this.buffer = this.buffer.slice(holdFrom);
    return out;
  }
}
