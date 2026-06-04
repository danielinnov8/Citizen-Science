---
name: orval generated hooks require queryKey in query options
description: TS2741 when passing custom query options to an orval-generated useQuery hook without queryKey
---

When you pass a custom `query` options object to an orval-generated React Query
hook (e.g. `useGetCurrentUser({ query: { retry: false, staleTime: ... } })`),
TypeScript fails with `TS2741: Property 'queryKey' is missing`. The generated
`UseQueryOptions` type requires `queryKey` once you supply your own options
object.

**Fix:** include the matching generated key getter, e.g.
`query: { queryKey: getGetCurrentUserQueryKey(), retry: false, ... }`.

**Why:** the codegen only injects a default `queryKey` when you pass no options;
supplying any options means you must supply the key too.

**How to apply:** whenever overriding query options on a generated `use*` query
hook in this repo, import and pass the corresponding `get*QueryKey()`.
