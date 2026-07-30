# Suporte a CNPJ alfanumérico (validator + mask)

## Contexto

A Receita Federal passa a emitir CNPJ no novo formato alfanumérico a partir de 31/07/2026 (Nota Técnica COCAD/SUARA/RFB nº 49/2024, IN RFB nº 2.229/2024). CNPJs já existentes (só números) continuam válidos para sempre — o novo formato é aditivo, não substitui.

Formato: mantém 14 caracteres (`AA.AAA.AAA/AAAA-DV`). Posições 1-12 (raiz + ordem) podem ser dígito (0-9) ou letra maiúscula A-Z (sem acento, sem caractere especial). Posições 13-14 (dígitos verificadores) continuam **sempre numéricas**.

Algoritmo do DV: módulo 11, idêntico ao já usado pela lib para CNPJ numérico — só generaliza a conversão caractere→valor. Cada caractere vira `charCodeAt(0) - 48`: dígito `'0'`-`'9'` mantém valor 0-9 (código ASCII 48-57), letra `'A'`-`'Z'` vira 17-42 (código ASCII 65-90). Pesos aplicados às 12 (DV1) / 13 (DV2, incluindo DV1) primeiras posições: `5,4,3,2,9,8,7,6,5,4,3,2` e `6,5,4,3,2,9,8,7,6,5,4,3,2` — mesma sequência que o código atual já usa via `position--`/wrap. Resto da soma mod 11: se `< 2`, DV = 0; senão DV = `11 - resto`. Confirmado por fonte técnica cruzada (cálculo bate exatamente com o algoritmo numérico já implementado, generalizado).

Hoje `lib/validators/index.ts` e `lib/masks/index.ts` tratam CPF e CNPJ com funções que assumem só dígito (`\D` fora). CNPJ alfanumérico quebra essa suposição.

## Decisões

| Decisão                      | Escolha                                                                                                                       | Motivo                                                                                                                                                                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nome do validator            | `brazilianCnpjValidator` → `cnpjValidator`, `brazilianCpfValidator` → `cpfValidator`                                          | Consistência de nome entre os dois (dropa prefixo `brazilian`), decidido junto por simetria — CPF e CNPJ sempre andaram como par na API.                                                                                                                            |
| Compat dos nomes antigos     | Remove direto, sem alias/deprecation                                                                                          | Pacote acabou de resetar pra `@zeeptech/toolkit@1.0.0` sem publish ainda no registry (ver `docs/superpowers/plans/2026-07-02-rename-to-zeeptech-toolkit.md`, Task 5 pendente) — zero consumidor instalado, breaking change sem custo real agora.                    |
| Mask CPF/CNPJ                | Separa `cpfOrCnpjMask` em `cpfMask` (lógica atual, só dígito, sem mudança de comportamento) e `cnpjMask` (novo, alfanumérico) | Uma função por documento evita heurística de auto-detecção (tamanho + presença de letra) ficar espalhada/ambígua; cada mask fica sozinha responsável por um formato.                                                                                                |
| Case das letras              | Normaliza pra maiúscula internamente (`toUpperCase()`) em `cnpjValidator`, `cnpjMask` e `cnpjClearMask`                       | Tolerante a input do usuário (`ab12cd34e01-83` valida igual `AB12CD34E01-83`), sem forçar o consumidor a normalizar antes de chamar.                                                                                                                                |
| Mask progressivo             | `cnpjMask` mantém formatação progressiva (funciona com string parcial, uso direto em `onChange`)                              | Paridade de UX com `cpfMask`/`brazilianTelephoneMask`, que já funcionam assim.                                                                                                                                                                                      |
| `clearMask` genérico         | Sem mudança — continua só dígito (`\D` fora)                                                                                  | Função usada por CPF/telefone/CEP hoje; mudar contrato dela pra manter letra quebraria esses usos (ex.: telefone com letra colada por engano deixaria de ser limpo).                                                                                                |
| Limpeza de CNPJ alfanumérico | Nova função `cnpjClearMask`                                                                                                   | `clearMask` apagaria as letras do CNPJ alfanumérico (`clearMask('AB12CD34E01-83')` → perde as letras, resultado inválido) — quebra o round-trip com `cnpjMask`. `cnpjClearMask` normaliza maiúscula e remove só pontuação (`.`, `/`, `-`), mantendo letra e número. |

## O que muda

### `lib/validators/index.ts`

1. `brazilianCpfValidator` renomeia para `cpfValidator`. Lógica interna intocada (CPF continua só numérico — Receita não anunciou CPF alfanumérico).
2. `brazilianCnpjValidator` renomeia para `cnpjValidator`. Lógica interna:
   - Normaliza: `value.toUpperCase().replace(/[^0-9A-Z]/g, '')`.
   - Rejeita se `length !== 14`.
   - Rejeita repetição do mesmo caractere 14x (`/^(.)\1+$/`, generalizado de `/^(\d)\1+$/`).
   - Rejeita se as posições 13-14 não forem `[0-9]{2}` (DV sempre numérico, mesmo com raiz/ordem alfanumérico).
   - `calculateDigit` troca `parseInt(char)` por `char.charCodeAt(0) - 48`. Pesos e regra de resto (mod 11, `<2`→0 senão `11-resto`) idênticos ao código atual.
   - CNPJ 100% numérico continua validando exatamente igual a hoje (charCodeAt-48 de um dígito == parseInt do mesmo dígito) — sem regressão nos casos existentes.

### `lib/masks/index.ts`

1. `cpfOrCnpjMask` é removida.
2. Nova `cpfMask(value)`: mesma lógica de formatação que o branch CPF de `cpfOrCnpjMask` hoje (`\d` só, progressivo).
3. Nova `cnpjMask(value)`: normaliza maiúscula, regex trocando `\d` por `[0-9A-Z]` nas posições 1-12 (raiz/ordem), mantém `\d` no grupo do DV (posições 13-14). Progressivo, funciona com string parcial.
4. `clearMask` sem mudança.
5. Nova `cnpjClearMask(value)`: `value.toUpperCase().replace(/[^0-9A-Z]/g, '')` — mantém letra e número, remove só pontuação.

### Consumidores internos do rename

Referências a atualizar (24 ocorrências levantadas): `lib/validators/index.ts`, `lib/masks/index.ts`, `__tests__/validator.spec.ts`, `__tests__/masks.spec.ts`, `README.md`. `lib/index.ts` é barrel `export *` — sem mudança de conteúdo, só passa a re-exportar os nomes novos automaticamente.

## O que NÃO muda nesta etapa

- CPF continua exclusivamente numérico — sem indício de CPF alfanumérico na regulamentação.
- `clearMask` genérico mantém contrato atual (só dígito).
- Sem mudança em `brazilianTelephoneMask`, `brazilianZipcodeMask`, `globalCellphoneMask` ou qualquer outro validator/mask fora de CPF/CNPJ.
- Sem alias/deprecation para os nomes antigos (`brazilianCpfValidator`, `brazilianCnpjValidator`, `cpfOrCnpjMask`) — remoção direta, ver decisão acima.

## Testes a cobrir

- `cnpjValidator`: CNPJ numérico legado (regressão — mesmos casos válidos/inválidos de hoje continuam batendo), CNPJ alfanumérico válido com letra em cada posição do bloco raiz/ordem (1-12), letra minúscula normalizada, DV com letra (deve invalidar), todos caracteres repetidos (deve invalidar), tamanho errado.
- `cpfValidator`: sem novo caso — só a renomeação, testes existentes migram de nome de função chamada.
- `cnpjMask`: formatação completa de CNPJ alfanumérico, formatação progressiva char a char (simula digitação), CNPJ numérico completo pelo `cnpjMask` (deve formatar igual ao que `cpfOrCnpjMask` fazia hoje pro branch CNPJ).
- `cpfMask`: sem novo caso — só a renomeação/split, mesmo comportamento de hoje.
- `cnpjClearMask`: remove pontuação mantendo letra e número, normaliza maiúscula, round-trip com `cnpjMask` (`cnpjClearMask(cnpjMask(x)) === x.toUpperCase()` pros casos alfanuméricos).

## Fora de escopo / próximos passos (não fazer agora)

- Atualizar `README.md` além da renomeação de nomes de função nos exemplos (não é objetivo desta spec redigir prosa nova sobre CNPJ alfanumérico no README — cobrir só os exemplos de import/uso que já citam os nomes renomeados).
- Publicação da nova versão no npm — cai na Task 5 do plano de rename já existente (`docs/superpowers/plans/2026-07-02-rename-to-zeeptech-toolkit.md`), pendente de go humano, não faz parte deste spec.
- Suporte a formatos regionais de identificador fora do CNPJ (ex.: CAEPF, CNO) — fora de escopo, não mencionado pelo usuário.
