import { afterEach, describe, expect, it, vi } from "vitest";
import { sendEmail, ResendRejectedError } from "./resend";

function stubFetchCapture() {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: "msg_1" }),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function lastRequestBody(fetchMock: ReturnType<typeof vi.fn>) {
  const init = fetchMock.mock.calls[0]?.[1] as { body: string };
  return JSON.parse(init.body) as Record<string, unknown>;
}

// Preserve any pre-configured key so these tests can't corrupt the env for
// later suites running in the same worker.
const ORIGINAL_API_KEY = process.env.RESEND_API_KEY;

describe("sendEmail", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    if (ORIGINAL_API_KEY === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = ORIGINAL_API_KEY;
    }
  });

  const base = {
    to: "prospect@example.com",
    subject: "Hello",
    html: "<p>hi</p>",
    fromEmail: "daniel@citizen-science.org",
    fromName: "Daniel (Citizen Science)",
  };

  it("includes a BCC copy when provided", async () => {
    process.env.RESEND_API_KEY = "test-key";
    const fetchMock = stubFetchCapture();

    await sendEmail({ ...base, bcc: "daniel@citizen-science.org" });

    const body = lastRequestBody(fetchMock);
    expect(body.bcc).toEqual(["daniel@citizen-science.org"]);
    expect(body.from).toBe("Daniel (Citizen Science) <daniel@citizen-science.org>");
    expect(body.to).toEqual(["prospect@example.com"]);
  });

  it("omits BCC entirely when not provided", async () => {
    process.env.RESEND_API_KEY = "test-key";
    const fetchMock = stubFetchCapture();

    await sendEmail(base);

    expect(lastRequestBody(fetchMock).bcc).toBeUndefined();
  });

  it("includes a text/plain alternative when provided", async () => {
    process.env.RESEND_API_KEY = "test-key";
    const fetchMock = stubFetchCapture();

    await sendEmail({ ...base, text: "Hi Ada,\n\nPlain body" });

    expect(lastRequestBody(fetchMock).text).toBe("Hi Ada,\n\nPlain body");
  });

  it("omits the text part when not provided", async () => {
    process.env.RESEND_API_KEY = "test-key";
    const fetchMock = stubFetchCapture();

    await sendEmail(base);

    expect(lastRequestBody(fetchMock).text).toBeUndefined();
  });

  it("throws when RESEND_API_KEY is missing", async () => {
    // Arrange the missing-key state explicitly — don't rely on test order.
    delete process.env.RESEND_API_KEY;
    await expect(sendEmail(base)).rejects.toThrow("RESEND_API_KEY");
  });

  it("throws ResendRejectedError on a definitive 4xx rejection (safe to requeue)", async () => {
    process.env.RESEND_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        text: async () => "validation failed",
      }),
    );
    await expect(sendEmail(base)).rejects.toBeInstanceOf(ResendRejectedError);
  });

  it("throws a plain (ambiguous) error on 5xx — never ResendRejectedError", async () => {
    process.env.RESEND_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "internal",
      }),
    );
    const err = await sendEmail(base).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(ResendRejectedError);
  });

  it("propagates network failures as ambiguous errors — never ResendRejectedError", async () => {
    process.env.RESEND_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed")),
    );
    const err = await sendEmail(base).catch((e) => e);
    expect(err).toBeInstanceOf(TypeError);
    expect(err).not.toBeInstanceOf(ResendRejectedError);
  });
});
