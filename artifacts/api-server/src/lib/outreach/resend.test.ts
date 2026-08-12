import { afterEach, describe, expect, it, vi } from "vitest";
import { sendEmail } from "./resend";

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

  it("throws when RESEND_API_KEY is missing", async () => {
    // Arrange the missing-key state explicitly — don't rely on test order.
    delete process.env.RESEND_API_KEY;
    await expect(sendEmail(base)).rejects.toThrow("RESEND_API_KEY");
  });
});
