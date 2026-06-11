---
name: api-client-react barrel exports
description: How to access runtime error classes (ApiError) from @workspace/api-client-react in consumer code
---

# api-client-react barrel exports

The generated Orval client throws `ApiError` (and `ResponseParseError`) on non-2xx
responses. These classes are defined in `lib/api-client-react/src/custom-fetch.ts`,
but the barrel (`src/index.ts`) only re-exports `* from generated/*` plus a hand-picked
list from custom-fetch.

**Rule:** to branch on HTTP status in a consumer (e.g. handle `402` out-of-credits or
`409` duplicate distinctly), import `ApiError` from `@workspace/api-client-react` and use
`err instanceof ApiError && err.status === 402` with `err.data` (parsed JSON body, typed
to the schema, e.g. `OutOfCreditsError`). If `ApiError` is "not an exported member", add it
to the barrel:

```ts
export { setBaseUrl, setAuthTokenGetter, ApiError, ResponseParseError } from "./custom-fetch";
export type { AuthTokenGetter, ErrorType } from "./custom-fetch";
```

**Why:** mutation `onError` only gives you a generic `Error` unless you narrow with
`instanceof ApiError`; the React Query hook's `TError` is typed as `ErrorType<...>` which
is `ApiError<...>` but the class itself must be importable at runtime to use `instanceof`.

**How to apply:** it's a composite lib — after editing `index.ts` run `pnpm run typecheck:libs`
(rebuilds declarations) BEFORE the artifact typecheck picks up the new export.
