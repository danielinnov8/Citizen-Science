---
name: Orval response-name collision
description: Why naming an OpenAPI component schema {OperationId}Response breaks zod codegen
---
The zod target auto-names each operation's response validator `{OperationId}Response`
(e.g. operationId `getChallengeSolution` → `GetChallengeSolutionResponse`) and puts it in
`generated/api.ts`, while component schemas become TS types in `generated/types/`. The
api-zod barrel does `export * from "./generated/api"` + `export type * from "./generated/types"`.

**Rule:** never name a component schema with the `{OperationId}Response` pattern of any
operation that returns it. If you do, the barrel re-exports a value and a type of the same
name → TS2308 "already exported a member". The react-query (api-client-react) target does
NOT collide (it only emits the component type), so the build can look half-broken: the
component type resolves there but the zod libs fail to compile.

**Why:** a merged task named a response component `GetChallengeSolutionResponse`; codegen
had never been run successfully for it, so HEAD shipped with the generated client referencing
an undefined type and the whole repo typecheck red.

**How to apply:** name response components after the resource (`ChallengeSolutionDetail`,
`SolutionWithContext`), not after the operation. After any spec change, run
`pnpm --filter @workspace/api-spec run codegen` (it chains `typecheck:libs`) and confirm green.
