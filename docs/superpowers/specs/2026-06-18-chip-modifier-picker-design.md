# Chip Modifier Picker — Design Spec
Date: 2026-06-18

## Summary

Add a split-chip UI to the email builder's variable chip row. Left side inserts the variable plain; right side (▾) opens a Mantine Menu dropdown to pick a modifier before inserting. Modifiers are applied at render time in `template.ts` and written into the token string (e.g. `{{NAME|upper}}`).

## Modifiers

| Modifier   | Behaviour                              | Language note       |
|------------|----------------------------------------|---------------------|
| `upper`    | `.toUpperCase()`                       | works on Greek      |
| `lower`    | `.toLowerCase()`                       | works on Greek      |
| `title`    | Capitalize first letter of each word   | works on Greek      |
| `trim`     | `.trim()`                              | language-neutral    |
| `ordinal`  | 1 → 1st, 2 → 2nd, 3 → 3rd (already exists) | English only   |

## Files Changed

### `src/lib/template.ts`
- `applyModifier`: add cases for `upper`, `lower`, `title`, `trim` (ordinal already present)
- `title` impl: split on whitespace, capitalize each word, rejoin

### `src/hooks/useEmailTemplateBuilder.ts`
- `insertFieldToken(variable, modifier?)`: add optional `modifier` param
- Token emitted: `{{VARIABLE}}` when no modifier, `{{VARIABLE|modifier}}` when modifier set

### `src/components/EmailTemplateEditor.tsx`
- Replace each chip `<Button>` with a Mantine `Button.Group`:
  - Left `<Button>`: calls `insertFieldToken(variable)`, inserts into active editor
  - Right `<Button>` (`▾`): renders a `<Menu>` listing all modifiers; clicking one calls `insertFieldToken(variable, modifier)` and inserts
- Prop type `insertFieldToken` updated to `(variable: string, modifier?: string) => string`

### `src/i18n.tsx`
- Add `modifierLabels` to `Translation` type — a `Record<string, string>` mapping modifier key → display label
- EN labels: `{ upper: 'UPPERCASE', lower: 'lowercase', title: 'Title Case', trim: 'Trim spaces', ordinal: 'Ordinal (1st, 2nd…) — English only' }`
- EL labels: `{ upper: 'ΚΕΦΑΛΑΙΑ', lower: 'πεζά', title: 'Αρχικά Κεφαλαία', trim: 'Αφαίρεση κενών', ordinal: 'Ordinal (1st, 2nd…) — English only' }`
- Update `modifierHint` in both languages to list all five modifiers with examples

## Modifier Order in Dropdown

1. No modifier (plain insert) — shown as first item, separated by a divider from the rest
2. UPPERCASE / lower / Title Case / Trim spaces / Ordinal

## Constraints

- `ordinal` shown in both language dropdowns but labelled "English only" — safe to use on any field, just produces English ordinal suffixes regardless of UI language
- `title` splits on `/\s+/` — works correctly on Greek words
- No changes to the Python runtime — modifiers are purely a renderer-side concern; the `{{VAR|modifier}}` syntax is already parsed by `generate_email_drafts.py` and `generate_contracts.py` via the existing regex `PLACEHOLDER_RE`
