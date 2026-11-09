# example/

Proof that the tooling works. Not part of the prototype: excluded from the build,
the typecheck and `npm run lint:tokens`.

- `tokens.css`: FAKE tokens (neutral greys), only for this test.
- `button.tsx` + `button.states.tsx`: a Button built the way the kit asks
  (shadcn structure, semantic token utilities only).
- `fixtures/bad.tsx`: deliberately breaks the token rules.

`npm run selftest` checks that lint-tokens accepts the Button and rejects the
fixture, that visual-diff passes on a matching reference and fails on a wrong
one, and that axe passes on the Button states.
