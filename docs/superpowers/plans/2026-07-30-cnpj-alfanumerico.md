# CNPJ Alfanumérico Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename `brazilianCpfValidator`/`brazilianCnpjValidator` to `cpfValidator`/`cnpjValidator`, split `cpfOrCnpjMask` into standalone `cpfMask`/`cnpjMask`, add a new `cnpjClearMask`, and make the CNPJ validator/mask/clear functions accept the Receita Federal alphanumeric CNPJ format (effective 2026-07-31) without regressing any existing all-numeric CNPJ/CPF behavior.

**Architecture:** Pure library-code change inside `lib/validators/index.ts` and `lib/masks/index.ts` — no new files, no new dependencies. The CNPJ algorithm change is a generalization of the existing digit-only `calculateDigit` (swap `parseInt(char)` for `char.charCodeAt(0) - 48`, which produces the same value for digit characters — so numeric CNPJs are mathematically unaffected). The mask split extracts the existing CPF branch of `cpfOrCnpjMask` verbatim into `cpfMask` and writes a new alphanumeric-aware `cnpjMask`.

**Tech Stack:** TypeScript, Jest (`ts-jest`), ESLint, Prettier — all already configured in this repo, no new tooling.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-30-cnpj-alfanumerico-design.md` — this plan implements it in full; do not deviate from its decisions table without flagging it.
- No alias/deprecation for old names (`brazilianCpfValidator`, `brazilianCnpjValidator`, `cpfOrCnpjMask`) — remove them outright, per spec decision (package not yet published to npm, zero installed consumers).
- CPF stays exclusively numeric — do not touch CPF validation logic beyond the rename, and do not add alphanumeric handling to `cpfValidator`/`cpfMask`.
- `clearMask` (existing, digit-only) stays completely untouched — do not edit `lib/masks/index.ts` lines implementing it.
- Every task that edits tracked files ends with `npm run build && npm run lint:check && npx prettier --check . && npx jest` before committing — must stay green throughout (baseline before this plan: `Tests: 117 passed, 117 total`).
- No version bump in `package.json` — package is still unpublished at `1.0.0` (see `docs/superpowers/plans/2026-07-02-rename-to-zeeptech-toolkit.md`, Task 5 pending), so this breaking rename costs nothing extra right now.
- Character→value mapping for the alphanumeric algorithm: `char.charCodeAt(0) - 48`. Digit `'0'`-`'9'` → 0-9 (ASCII 48-57). Letter `'A'`-`'Z'` → 17-42 (ASCII 65-90). Weights: `[5,4,3,2,9,8,7,6,5,4,3,2]` for DV1 (12 chars), `[6,5,4,3,2,9,8,7,6,5,4,3,2]` for DV2 (13 chars, base + DV1). Remainder rule: `sum % 11`; if `< 2` → digit `0`, else `11 - remainder`.
- Canonical valid alphanumeric CNPJ fixture used throughout this plan's tests (hand-verified against the algorithm above): raw `12ABC34501DE35`, masked `12.ABC.345/01DE-35`. Do not substitute a different fixture — every test below is pinned to this exact string.

---

### Task 1: Rename `brazilianCpfValidator` → `cpfValidator`

**Files:**

- Modify: `lib/validators/index.ts:19` (function declaration + JSDoc `@example` lines 12-17)
- Modify: `__tests__/validator.spec.ts:1-21` (import + describe block)
- Modify: `README.md:398-406`

**Interfaces:**

- Consumes: none (first task).
- Produces: `cpfValidator(value: string): boolean` — identical behavior to the old `brazilianCpfValidator`, same signature. Later tasks do not depend on this function directly.

- [ ] **Step 1: Update the test file to use the new name**

In `__tests__/validator.spec.ts`, change the import and describe block:

```ts
import {
  cpfValidator,
  brazilianCnpjValidator,
  emailIsValid,
  nameIsValid,
  fullnameIsValid,
  validNameAndLastName,
  brazilianTelephoneValidator,
  birthdateIs18Plus,
  passwordStrongValidator,
} from '../lib/validators'

describe('cpfValidator', () => {
  test('Valid CPF', () => {
    expect(cpfValidator('123.456.789-09')).toBe(true)
  })

  test('Invalid CPF', () => {
    expect(cpfValidator('123.456.789-00')).toBe(false)
  })
})
```

(Leave `brazilianCnpjValidator` as-is in this file for now — it's renamed in Task 2.)

- [ ] **Step 2: Run tests to confirm the expected failure**

Run: `npx jest __tests__/validator.spec.ts`
Expected: FAIL — `'../lib/validators' does not provide an export named 'cpfValidator'` (or similar TS/module error), since the source still exports `brazilianCpfValidator`.

- [ ] **Step 3: Rename the function in the source**

In `lib/validators/index.ts`, change the JSDoc `@example` (lines 12-17) and the function declaration (line 19) from `brazilianCpfValidator` to `cpfValidator`:

```ts
/**
 * Validates a Brazilian CPF (Cadastro de Pessoas Físicas).
 *
 * The CPF is a unique identifier for Brazilian individuals, and it follows a specific format
 * with 11 digits. This function checks the validity of a given CPF string by verifying its
 * length, ensuring it doesn't consist of repeated digits, and calculating its verification digits.
 *
 * @param {string} value - The CPF string to be validated. It can contain non-digit characters
 *                         which will be removed during validation.
 * @returns {boolean} - Returns true if the CPF is valid, otherwise false.
 *
 * @example
 * // Valid CPF
 * console.log(cpfValidator('123.456.789-09')); // true
 *
 * // Invalid CPF
 * console.log(cpfValidator('123.456.789-00')); // false
 */
export function cpfValidator(value: string): boolean {
  const cpf = value.replace(/\D/g, '')

  if (cpf.length !== 11) return false

  if (/^(\d)\1+$/.test(cpf)) return false

  const calculateDigit = (cpf: string, factor: number): number => {
    let sum = 0
    for (let i = 0; i < cpf.length; i++) {
      sum += parseInt(cpf.charAt(i)) * factor--
    }
    const result = sum % 11
    return result < 2 ? 0 : 11 - result
  }

  const firstNineDigits = cpf.substring(0, 9)
  const firstDigit = calculateDigit(firstNineDigits, 10)
  if (firstDigit !== parseInt(cpf.charAt(9))) return false

  const firstTenDigits = cpf.substring(0, 10)
  const secondDigit = calculateDigit(firstTenDigits, 11)
  if (secondDigit !== parseInt(cpf.charAt(10))) return false

  return true
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npx jest __tests__/validator.spec.ts`
Expected: PASS, `cpfValidator` describe block green.

- [ ] **Step 5: Update README**

In `README.md`, change lines 398-406 from:

````markdown
### BrazilianCpfValidator

- Validates a Brazilian CPF.

```js
import { brazilianCpfValidator } from '@zeeptech/toolkit'

brazilianCpfValidator('123.456.789-09') // Ex: true ou false
```
````

````

to:

```markdown
### CPF Validator

- Validates a Brazilian CPF.

```js
import { cpfValidator } from '@zeeptech/toolkit'

cpfValidator('123.456.789-09') // Ex: true ou false
````

````

- [ ] **Step 6: Full verification and commit**

Run: `npm run build && npm run lint:check && npx prettier --check . && npx jest`
Expected: all green.

```bash
git add lib/validators/index.ts __tests__/validator.spec.ts README.md
git commit -m "$(cat <<'EOF'
refactor: rename brazilianCpfValidator to cpfValidator

Consistency rename per docs/superpowers/specs/2026-07-30-cnpj-alfanumerico-design.md
— paired with the CNPJ validator rename in the next commit. No behavior
change, package unpublished so no deprecation alias needed.
EOF
)"
````

---

### Task 2: Rename `brazilianCnpjValidator` → `cnpjValidator` and add alphanumeric support

**Files:**

- Modify: `lib/validators/index.ts:64-91` (function declaration, JSDoc, algorithm)
- Modify: `__tests__/validator.spec.ts` (import + describe block)
- Modify: `README.md:408-416`

**Interfaces:**

- Consumes: none directly (independent of Task 1's `cpfValidator`).
- Produces: `cnpjValidator(value: string): boolean`. Validates both all-numeric CNPJ (14 digits) and alphanumeric CNPJ (letters A-Z allowed in positions 1-12, digits only in positions 13-14). Case-insensitive (normalizes to uppercase internally). No other task consumes this function.

- [ ] **Step 1: Write the failing tests**

In `__tests__/validator.spec.ts`, update the import to add `cnpjValidator` (replacing `brazilianCnpjValidator`) and replace the CNPJ describe block:

```ts
import {
  cpfValidator,
  cnpjValidator,
  emailIsValid,
  nameIsValid,
  fullnameIsValid,
  validNameAndLastName,
  brazilianTelephoneValidator,
  birthdateIs18Plus,
  passwordStrongValidator,
} from '../lib/validators'
```

```ts
describe('cnpjValidator', () => {
  test('Valid numeric CNPJ', () => {
    expect(cnpjValidator('12.345.678/0001-95')).toBe(true)
  })

  test('Invalid numeric CNPJ (wrong check digit)', () => {
    expect(cnpjValidator('12.345.678/0001-96')).toBe(false)
  })

  test('Valid alphanumeric CNPJ', () => {
    expect(cnpjValidator('12.ABC.345/01DE-35')).toBe(true)
  })

  test('Valid alphanumeric CNPJ, lowercase letters normalized', () => {
    expect(cnpjValidator('12.abc.345/01de-35')).toBe(true)
  })

  test('Invalid alphanumeric CNPJ (wrong check digit)', () => {
    expect(cnpjValidator('12.ABC.345/01DE-36')).toBe(false)
  })

  test('Invalid CNPJ when a check digit position holds a letter', () => {
    expect(cnpjValidator('12.ABC.345/01DE-3F')).toBe(false)
  })

  test('Invalid CNPJ with all repeated characters', () => {
    expect(cnpjValidator('AA.AAA.AAA/AAAA-AA')).toBe(false)
  })

  test('Invalid CNPJ with wrong length', () => {
    expect(cnpjValidator('12.ABC.345/01DE')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npx jest __tests__/validator.spec.ts`
Expected: FAIL — `cnpjValidator` not exported yet (source still exports `brazilianCnpjValidator`), and even once renamed the alphanumeric cases would fail against the old digit-only algorithm.

- [ ] **Step 3: Rewrite the function in the source**

In `lib/validators/index.ts`, replace lines 46-91 (the `brazilianCnpjValidator` JSDoc + function) with:

```ts
/**
 * Validates a Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica).
 *
 * The CNPJ is a unique identifier for Brazilian companies. This function validates both
 * the legacy all-numeric format and the alphanumeric format introduced by the Receita
 * Federal (effective 2026-07-31, Nota Técnica COCAD/SUARA/RFB nº 49/2024): positions 1-12
 * (root + order) may be digits (0-9) or uppercase letters (A-Z), while positions 13-14
 * (check digits) are always numeric. Input is normalized to uppercase and non-alphanumeric
 * characters are stripped before validation, so masked or lowercase input is accepted.
 *
 * @param {string} value - The CNPJ string to be validated. May contain mask punctuation
 *                         (`.`, `/`, `-`) and lowercase letters, which are normalized away.
 * @returns {boolean} - Returns true if the CNPJ is valid, otherwise false.
 *
 * @example
 * // Valid numeric CNPJ
 * console.log(cnpjValidator('12.345.678/0001-95')); // true
 *
 * // Valid alphanumeric CNPJ
 * console.log(cnpjValidator('12.ABC.345/01DE-35')); // true
 *
 * // Invalid CNPJ
 * console.log(cnpjValidator('12.345.678/0001-96')); // false
 */
export function cnpjValidator(value: string): boolean {
  const cnpj = value.toUpperCase().replace(/[^0-9A-Z]/g, '')

  if (cnpj.length !== 14) return false

  if (/^(.)\1+$/.test(cnpj)) return false

  if (!/^[0-9]{2}$/.test(cnpj.slice(12))) return false

  const charValue = (char: string): number => char.charCodeAt(0) - 48

  const calculateDigit = (base: string, weights: number[]): number => {
    let sum = 0
    for (let i = 0; i < base.length; i++) {
      sum += charValue(base.charAt(i)) * weights[i]
    }
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const base12 = cnpj.substring(0, 12)
  const digit1 = calculateDigit(base12, weights1)
  const digit2 = calculateDigit(base12 + digit1, weights2)

  return (
    digit1 === parseInt(cnpj.charAt(12)) && digit2 === parseInt(cnpj.charAt(13))
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npx jest __tests__/validator.spec.ts`
Expected: PASS, all 8 `cnpjValidator` cases plus the untouched `cpfValidator` cases green.

- [ ] **Step 5: Update README**

In `README.md`, change lines 408-416 from:

````markdown
### Brazilian CNPJ Validator

- Validates a Brazilian CNPJ.

```js
import { brazilianCnpjValidator } from '@zeeptech/toolkit'

brazilianCnpjValidator('12.345.678/0001-95') // Ex: true ou false
```
````

````

to:

```markdown
### CNPJ Validator

- Validates a Brazilian CNPJ — accepts both the legacy all-numeric format and the alphanumeric format effective 2026-07-31.

```js
import { cnpjValidator } from '@zeeptech/toolkit'

cnpjValidator('12.345.678/0001-95') // Ex: true ou false
cnpjValidator('12.ABC.345/01DE-35') // Ex: true ou false
````

````

- [ ] **Step 6: Full verification and commit**

Run: `npm run build && npm run lint:check && npx prettier --check . && npx jest`
Expected: all green (8 new CNPJ cases replace 2 old ones, net +6 vs. baseline at this point in the plan).

```bash
git add lib/validators/index.ts __tests__/validator.spec.ts README.md
git commit -m "$(cat <<'EOF'
feat: rename brazilianCnpjValidator to cnpjValidator, support alphanumeric CNPJ

Generalizes the check-digit algorithm from parseInt(digit) to
char.charCodeAt(0) - 48, which is the ASCII-48 mapping the Receita
Federal specifies for the new alphanumeric CNPJ format (effective
2026-07-31) and produces identical values to the old digit-only
algorithm for all-numeric CNPJs — no regression for existing callers.

Per docs/superpowers/specs/2026-07-30-cnpj-alfanumerico-design.md.
EOF
)"
````

---

### Task 3: Split `cpfOrCnpjMask` into `cpfMask`

**Files:**

- Modify: `lib/masks/index.ts:1-34`
- Modify: `__tests__/masks.spec.ts:1-19`
- Modify: `README.md:113-124`

**Interfaces:**

- Consumes: none.
- Produces: `cpfMask(value: string): string` — CPF-only formatting (`xxx.xxx.xxx-xx`), progressive (works on partial input). This is a pure extraction of the existing CPF branch of `cpfOrCnpjMask` — no behavior change. `cnpjMask` (Task 4) is a separate function; this task does not produce it.

- [ ] **Step 1: Write the failing test**

In `__tests__/masks.spec.ts`, replace lines 1-19 (the `cpfOrCnpjMask` import and describe block) with:

```ts
import {
  cpfMask,
  brazilianZipcodeMask,
  brazilianTelephoneMask,
  globalCellphoneMask,
  clearMask,
} from '../lib/masks'

describe('cpfMask', () => {
  test('should apply CPF mask', () => {
    const result = cpfMask('12345678909')
    expect(result).toBe('123.456.789-09')
  })

  test('should progressively mask partial input while typing', () => {
    expect(cpfMask('1')).toBe('1')
    expect(cpfMask('123')).toBe('123')
    expect(cpfMask('1234')).toBe('123.4')
    expect(cpfMask('123456789')).toBe('123.456.789')
    expect(cpfMask('12345678909')).toBe('123.456.789-09')
  })
})
```

(`cnpjMask` import/tests are added in Task 4 — do not add them here.)

- [ ] **Step 2: Run tests to confirm the expected failure**

Run: `npx jest __tests__/masks.spec.ts`
Expected: FAIL — `'../lib/masks' does not provide an export named 'cpfMask'`.

- [ ] **Step 3: Replace the source function**

In `lib/masks/index.ts`, replace lines 1-34 (the `cpfOrCnpjMask` JSDoc + function) with:

```ts
/**
 * Applies a CPF mask to a string.
 *
 * Formats the input as a CPF (xxx.xxx.xxx-xx). Formats progressively as digits are
 * typed — it does not require the full number to be present, so it can be used directly
 * in an input's `onChange`.
 *
 * @param {string} value - The value to be formatted, containing only digits.
 * @returns {string} - The formatted value with the CPF mask applied.
 *
 * @example
 * console.log(cpfMask('12345678909')); // '123.456.789-09'
 */
export function cpfMask(value: string): string {
  value = value.replace(/\D/g, '')

  value = value.replace(/(\d{3})(\d)/, '$1.$2')
  value = value.replace(/(\d{3})(\d)/, '$1.$2')
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')

  return value
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npx jest __tests__/masks.spec.ts`
Expected: PASS, `cpfMask` describe block green.

- [ ] **Step 5: Update README**

In `README.md`, change lines 113-124 from:

````markdown
## Masks

### CPF or CNPJ Mask

- Applies CPF or CNPJ mask to a string.

```js
import { cpfOrCnpjMask } from '@zeeptech/toolkit'

cpfOrCnpjMask('12345678909')) // Ex CPF: '123.456.789-09'
cpfOrCnpjMask('68451802000151')) // EX CNPJ: '68.451.802/0001-51'
```
````

````

to:

```markdown
## Masks

### CPF Mask

- Applies a CPF mask to a string.

```js
import { cpfMask } from '@zeeptech/toolkit'

cpfMask('12345678909') // Ex: '123.456.789-09'
````

````

(The CNPJ Mask section is added right after this one in Task 4.)

- [ ] **Step 6: Full verification and commit**

Run: `npm run build && npm run lint:check && npx prettier --check . && npx jest`
Expected: all green.

```bash
git add lib/masks/index.ts __tests__/masks.spec.ts README.md
git commit -m "$(cat <<'EOF'
refactor: split cpfOrCnpjMask into standalone cpfMask

Extracted verbatim from the CPF branch of the old combined function —
no behavior change. Splitting per docs/superpowers/specs/2026-07-30-cnpj-alfanumerico-design.md
so cnpjMask (next commit) can carry alphanumeric logic without a
shared auto-detection heuristic.
EOF
)"
````

---

### Task 4: Add `cnpjMask` with alphanumeric support

**Files:**

- Modify: `lib/masks/index.ts` (add new function after `cpfMask`)
- Modify: `__tests__/masks.spec.ts` (add import + describe block)
- Modify: `README.md` (add CNPJ Mask section after CPF Mask)

**Interfaces:**

- Consumes: none (independent of `cpfMask`).
- Produces: `cnpjMask(value: string): string` — formats both numeric and alphanumeric CNPJ as `xx.xxx.xxx/xxxx-xx`, progressive, uppercases letters internally. Task 5 (`cnpjClearMask`) tests round-trip against this function's output, so its exact output format (uppercase, punctuation `.`/`/`/`-`) must match what's implemented here.

- [ ] **Step 1: Write the failing tests**

In `__tests__/masks.spec.ts`, add `cnpjMask` to the import list:

```ts
import {
  cpfMask,
  cnpjMask,
  brazilianZipcodeMask,
  brazilianTelephoneMask,
  globalCellphoneMask,
  clearMask,
} from '../lib/masks'
```

Add this describe block right after the `cpfMask` one:

```ts
describe('cnpjMask', () => {
  test('should apply CNPJ mask to a numeric CNPJ', () => {
    const result = cnpjMask('12345678000195')
    expect(result).toBe('12.345.678/0001-95')
  })

  test('should apply CNPJ mask to an alphanumeric CNPJ', () => {
    const result = cnpjMask('12ABC34501DE35')
    expect(result).toBe('12.ABC.345/01DE-35')
  })

  test('should uppercase lowercase letters', () => {
    const result = cnpjMask('12abc34501de35')
    expect(result).toBe('12.ABC.345/01DE-35')
  })

  test('should progressively mask partial alphanumeric input while typing', () => {
    expect(cnpjMask('1')).toBe('1')
    expect(cnpjMask('12')).toBe('12')
    expect(cnpjMask('12A')).toBe('12.A')
    expect(cnpjMask('12AB')).toBe('12.AB')
    expect(cnpjMask('12ABC')).toBe('12.ABC')
    expect(cnpjMask('12ABC3')).toBe('12.ABC.3')
    expect(cnpjMask('12ABC34')).toBe('12.ABC.34')
    expect(cnpjMask('12ABC345')).toBe('12.ABC.345')
    expect(cnpjMask('12ABC3450')).toBe('12.ABC.345/0')
    expect(cnpjMask('12ABC34501')).toBe('12.ABC.345/01')
    expect(cnpjMask('12ABC34501D')).toBe('12.ABC.345/01D')
    expect(cnpjMask('12ABC34501DE')).toBe('12.ABC.345/01DE')
    expect(cnpjMask('12ABC34501DE3')).toBe('12.ABC.345/01DE-3')
    expect(cnpjMask('12ABC34501DE35')).toBe('12.ABC.345/01DE-35')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npx jest __tests__/masks.spec.ts`
Expected: FAIL — `cnpjMask` not exported yet.

- [ ] **Step 3: Implement the function**

In `lib/masks/index.ts`, add this function right after `cpfMask`:

```ts
/**
 * Applies a CNPJ mask to a string.
 *
 * Formats the input as a CNPJ (xx.xxx.xxx/xxxx-xx). Accepts both the legacy all-numeric
 * CNPJ and the alphanumeric format introduced by the Receita Federal (effective
 * 2026-07-31): letters are allowed in the first 12 characters (root + order), the last two
 * (check digits) stay numeric. Input is uppercased internally, so lowercase letters are
 * accepted. Formats progressively as characters are typed — it does not require the full
 * value to be present, so it can be used directly in an input's `onChange`.
 *
 * @param {string} value - The value to be formatted, containing digits and/or letters.
 * @returns {string} - The formatted value with the CNPJ mask applied.
 *
 * @example
 * console.log(cnpjMask('12345678000195')); // '12.345.678/0001-95'
 * console.log(cnpjMask('12ABC34501DE35')); // '12.ABC.345/01DE-35'
 */
export function cnpjMask(value: string): string {
  value = value.toUpperCase().replace(/[^0-9A-Z]/g, '')

  value = value.replace(/^([0-9A-Z]{2})([0-9A-Z])/, '$1.$2')
  value = value.replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})([0-9A-Z])/, '$1.$2.$3')
  value = value.replace(/\.([0-9A-Z]{3})([0-9A-Z])/, '.$1/$2')
  value = value.replace(/([0-9A-Z]{4})(\d)/, '$1-$2')

  return value
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npx jest __tests__/masks.spec.ts`
Expected: PASS, all `cnpjMask` cases green alongside `cpfMask`.

- [ ] **Step 5: Update README**

In `README.md`, right after the "CPF Mask" section written in Task 3, add:

````markdown
### CNPJ Mask

- Applies a CNPJ mask to a string — accepts both the legacy all-numeric format and the alphanumeric format effective 2026-07-31.

```js
import { cnpjMask } from '@zeeptech/toolkit'

cnpjMask('68451802000151') // Ex: '68.451.802/0001-51'
cnpjMask('12ABC34501DE35') // Ex: '12.ABC.345/01DE-35'
```
````

````

- [ ] **Step 6: Full verification and commit**

Run: `npm run build && npm run lint:check && npx prettier --check . && npx jest`
Expected: all green.

```bash
git add lib/masks/index.ts __tests__/masks.spec.ts README.md
git commit -m "$(cat <<'EOF'
feat: add cnpjMask with alphanumeric CNPJ support

Same progressive-formatting behavior as the old cpfOrCnpjMask's CNPJ
branch for all-numeric input, extended to accept letters in the root/
order positions per the Receita Federal's 2026-07-31 alphanumeric
format. Per docs/superpowers/specs/2026-07-30-cnpj-alfanumerico-design.md.
EOF
)"
````

---

### Task 5: Add `cnpjClearMask`

**Files:**

- Modify: `lib/masks/index.ts` (add new function after `clearMask`)
- Modify: `__tests__/masks.spec.ts` (add describe block)
- Modify: `README.md` (add section after the existing "Clear Mask" doc, if present, else at end of Masks section)

**Interfaces:**

- Consumes: `cnpjMask`'s exact output format from Task 4 (uppercase letters, `.`/`/`/`-` punctuation) — this task's round-trip test depends on that.
- Produces: `cnpjClearMask(value: string): string`. No other task consumes this.

- [ ] **Step 1: Check whether README already documents `clearMask`**

Run: `grep -n "### Clear Mask\|## Clear Mask" README.md`

If a heading is found, note its line number — Step 5 below inserts right after that section. If nothing is found, Step 5 appends the new section at the end of the `## Masks` section instead (before the next `## ` heading).

- [ ] **Step 2: Write the failing tests**

In `__tests__/masks.spec.ts`, add this describe block after the existing `clearMask` block:

```ts
describe('cnpjClearMask', () => {
  test('should clear mask from an alphanumeric CNPJ', () => {
    const result = cnpjClearMask('12.ABC.345/01DE-35')
    expect(result).toBe('12ABC34501DE35')
  })

  test('should clear mask from a numeric CNPJ', () => {
    const result = cnpjClearMask('12.345.678/0001-95')
    expect(result).toBe('12345678000195')
  })

  test('should uppercase lowercase letters', () => {
    const result = cnpjClearMask('12.abc.345/01de-35')
    expect(result).toBe('12ABC34501DE35')
  })

  test('should round-trip with cnpjMask', () => {
    const raw = '12ABC34501DE35'
    expect(cnpjClearMask(cnpjMask(raw))).toBe(raw)
  })
})
```

Add `cnpjClearMask` to the top-of-file import list (alongside `cpfMask`, `cnpjMask`, etc.).

- [ ] **Step 3: Run tests to confirm they fail**

Run: `npx jest __tests__/masks.spec.ts`
Expected: FAIL — `cnpjClearMask` not exported yet.

- [ ] **Step 4: Implement the function**

In `lib/masks/index.ts`, add this function right after `clearMask`:

```ts
/**
 * Removes CNPJ mask punctuation while preserving letters, for the alphanumeric CNPJ format.
 *
 * Unlike `clearMask` (which strips everything but digits, for CPF/phone/CEP), this keeps
 * letters intact — stripping only `clearMask` would destroy an alphanumeric CNPJ's root/order
 * characters. Uppercases the result, so it round-trips with `cnpjMask`'s output regardless of
 * input case.
 *
 * @param {string} value - The masked CNPJ string, e.g. `'12.ABC.345/01DE-35'`.
 * @returns {string} - The unmasked value with letters preserved, e.g. `'12ABC34501DE35'`.
 *
 * @example
 * console.log(cnpjClearMask('12.ABC.345/01DE-35')); // '12ABC34501DE35'
 * console.log(cnpjClearMask('12.345.678/0001-95')); // '12345678000195'
 */
export function cnpjClearMask(value: string): string {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, '')
}
```

- [ ] **Step 5: Run tests to confirm they pass**

Run: `npx jest __tests__/masks.spec.ts`
Expected: PASS, all `cnpjClearMask` cases green.

- [ ] **Step 6: Update README**

Using the location found in Step 1, insert:

````markdown
### CNPJ Clear Mask

- Removes CNPJ mask punctuation while preserving letters, for the alphanumeric CNPJ format. Use this instead of `clearMask` when unmasking a CNPJ, since `clearMask` strips letters.

```js
import { cnpjClearMask } from '@zeeptech/toolkit'

cnpjClearMask('12.ABC.345/01DE-35') // Ex: '12ABC34501DE35'
```
````

````

- [ ] **Step 7: Full verification and commit**

Run: `npm run build && npm run lint:check && npx prettier --check . && npx jest`
Expected: all green.

```bash
git add lib/masks/index.ts __tests__/masks.spec.ts README.md
git commit -m "$(cat <<'EOF'
feat: add cnpjClearMask for alphanumeric CNPJ unmasking

clearMask stays digit-only (unchanged, still used by CPF/phone/CEP).
cnpjClearMask keeps letters, since blindly stripping non-digits from
an alphanumeric CNPJ destroys its root/order characters. Round-trips
with cnpjMask. Per docs/superpowers/specs/2026-07-30-cnpj-alfanumerico-design.md.
EOF
)"
````

---

### Task 6: Final sweep — confirm no stale references remain

**Files:** none modified (verification only, plus opportunistic fixup if Step 1 finds something).

**Interfaces:**

- Consumes: all exports from Tasks 1-5 (`cpfValidator`, `cnpjValidator`, `cpfMask`, `cnpjMask`, `cnpjClearMask`).
- Produces: nothing new — this is the plan's closing verification gate.

- [ ] **Step 1: Grep for any remaining reference to the removed names**

Run: `grep -rn "brazilianCpfValidator\|brazilianCnpjValidator\|cpfOrCnpjMask" lib __tests__ README.md`
Expected: no output (all three names fully removed from source, tests, and docs).

If this prints any match, open that file and fix it using the same rename mapping as Tasks 1-4 (`brazilianCpfValidator`→`cpfValidator`, `brazilianCnpjValidator`→`cnpjValidator`, `cpfOrCnpjMask`→`cpfMask` or `cnpjMask` depending on which branch's example it was) before proceeding.

- [ ] **Step 2: Confirm the new exports are reachable from the package root**

Run: `node -e "const lib = require('./dist'); console.log(typeof lib.cpfValidator, typeof lib.cnpjValidator, typeof lib.cpfMask, typeof lib.cnpjMask, typeof lib.cnpjClearMask)"`

(Run `npm run build` first if `dist/` is stale.)

Expected: `function function function function function` — all five new exports resolve through the `lib/index.ts` barrel (`export *`) with no explicit re-export list to update.

- [ ] **Step 3: Full suite one more time**

Run: `npm run build && npm run lint:check && npx prettier --check . && npx jest`
Expected: all green. Final test count: 117 (baseline) − 6 (old `brazilianCpfValidator`, `brazilianCnpjValidator`, `cpfOrCnpjMask` tests removed: 2+2+2) + 20 (new `cpfValidator`: 2, `cnpjValidator`: 8, `cpfMask`: 2, `cnpjMask`: 4, `cnpjClearMask`: 4) = 131 passed.

- [ ] **Step 4: Commit (only if Step 1 required a fixup; otherwise skip — nothing to commit)**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: sweep stale references to renamed CPF/CNPJ functions
EOF
)"
```

---

## Self-Review Notes

- **Spec coverage:** every decision row of `docs/superpowers/specs/2026-07-30-cnpj-alfanumerico-design.md` maps to a task — validator renames (Tasks 1-2), mask split (Tasks 3-4), `cnpjClearMask` (Task 5), `clearMask` untouched (enforced as a Global Constraint plus explicitly not modified in any task), README updates (folded into each task's Step 5/6), stale-reference sweep (Task 6).
- **Fixture consistency:** the same alphanumeric CNPJ fixture (`12ABC34501DE35` / `12.ABC.345/01DE-35`) is reused across Tasks 2, 4, and 5 so the round-trip test in Task 5 and the validator test in Task 2 agree on what "valid" looks like — verified by hand-running the algorithm in Global Constraints before writing this plan.
- **Type/name consistency:** `cpfValidator`, `cnpjValidator`, `cpfMask`, `cnpjMask`, `cnpjClearMask` — checked identical spelling/casing across all six tasks' code blocks, test blocks, and README blocks.
- **Placeholder scan:** no TBD/TODO; Task 6 Step 1's "if this prints any match, fix it" is a real conditional check with an explicit fix procedure, not an open placeholder.
- **No alias handling anywhere** — confirmed no task adds a deprecated re-export of the three removed names, matching the spec's explicit decision.
