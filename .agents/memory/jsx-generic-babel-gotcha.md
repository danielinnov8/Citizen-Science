---
name: TSX JSX generic args break Replit babel transform
description: Why <Comp<T>> JSX generic type arguments crash the dev build on Replit even though they typecheck.
---

# JSX generic type args crash Replit's vite babel transform

Writing explicit generic type arguments on a JSX element — e.g.
`<ReactFlow<AppNode, Edge> ...>` or `<List<Item> ...>` — typechecks fine in
`tsc`, but the Vite dev/build step throws a Babel parse error:
`[plugin:vite:react-babel] ... Unexpected token` pointing at the `<` of the
generic. The whole route 500s with a stack full of `jsxParse*` frames.

**Why:** Replit's React artifacts run `@vitejs/plugin-react` with extra Babel
metadata plugins (cartographer / dev-banner / runtime-error-modal). That Babel
JSX parser does not support the TS `<Comp<T>>` JSX-generic syntax, even though
TypeScript and many other toolchains do.

**How to apply:** never put generic type arguments directly on a JSX element in
this repo's web artifacts. Let the component infer its generics from props
(passing typed `nodes`/`edges`/`data` is usually enough). If you must pin the
type, do it on a variable/cast (`const x: Foo = ...`) or via the hook
(`useNodesState<AppNode>(...)`), not on the JSX tag. Symptom to recognize: code
passes `pnpm typecheck` but the page white-screens with a `vite:react-babel`
`Unexpected token` at a `<`.
