# Renomear js-essential-kit para @zeeptech/toolkit

## Contexto

`js-essential-kit` é hoje publicada sem escopo no npm (5 versões, `1.0.0`→`1.2.0`, mantenedor `julioamsousa <julio@iorder.com.br>`), no repositório GitHub `zeeplabs/js-essential-kit`. A lib mistura utilitários genéricos (`isEmpty`, `capitalizeWords`) com regras de negócio brasileiras (CPF/CNPJ/CEP) e dataset estático de países/cidades.

Objetivo do dono do projeto: reposicionar a lib como biblioteca central de funções utilitárias reutilizadas em múltiplos projetos próprios, hoje frequentemente duplicadas projeto a projeto. Parte dessa reposição é dar um nome definitivo e um lar (escopo npm) para o pacote.

## Decisões

| Decisão                                      | Escolha                                                   | Motivo                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Escopo npm                                   | `@zeeptech`                                               | Já é conta/org do dono no npm (confirmado: mantém `@zeeptech/orbit-client`). Escopo não registrado sob `@zeeplabs`, mas `@zeeptech` já existe e pertence ao dono.                                                                                                                                                                              |
| Nome do pacote                               | `@zeeptech/toolkit`                                       | Estilo descritivo direto, comunica o propósito sem precisar de contexto externo. Sem prefixo `ts-`/`typescript-`: redundante dentro de um escopo próprio (sem concorrência de nome a resolver) e potencialmente enganoso — a lib compila pra JS puro e roda em projetos sem TypeScript, então "ts-" sugeriria incorretamente uso exclusivo TS. |
| Visibilidade                                 | Pública                                                   | Escopo não implica privado. Pacote privado exigiria npm Org paga ou GitHub Packages com auth por projeto consumidor — fricção desnecessária sem ganho de confidencialidade real (não há segredo de negócio no código).                                                                                                                         |
| Escopo do conteúdo (BR-specific vs genérico) | Mantém tudo em um pacote só                               | Decisão consciente de não separar agora. Trade-off aceito: bundle inclui código/dados que nem todo consumidor usa (mitigado parcialmente por `sideEffects: false`, já aplicado). Reavaliar split futuro se o pacote crescer muito ou se surgir um consumidor que precise só da parte genérica.                                                 |
| Nome do repositório GitHub                   | Renomear `zeeplabs/js-essential-kit` → `zeeplabs/toolkit` | Repo continua na org `zeeplabs` (só o escopo npm é `@zeeptech` — já eram coisas diferentes antes do rename). Nome do repo passa a bater com o nome do pacote (`toolkit`), sem o prefixo de escopo (repos GitHub não têm conceito de scope). GitHub redireciona automaticamente o nome antigo — não quebra clones/links existentes.             |

## O que muda

1. **`package.json`**: campo `name` de `js-essential-kit` para `@zeeptech/toolkit`. Campos `repository`/`bugs` atualizados para a nova URL do repo.
2. **Repositório GitHub**: renomeado. URL antiga redireciona automaticamente (comportamento nativo do GitHub).
3. **Publicação npm**: nova versão publicada sob `@zeeptech/toolkit` (major bump — é uma mudança de identidade do pacote, não um patch/minor).
4. **Pacote antigo (`js-essential-kit`)**: marcado como deprecated via `npm deprecate js-essential-kit "Renamed to @zeeptech/toolkit — see <nova-url-do-repo>"`. Não é removido do registry (não dá pra despublicar depois de 72h de uma versão com downloads, e não há necessidade — só sinaliza pra quem instalar que existe sucessor).
5. **README/CHANGELOG**: nota de migração no topo do README explicando o rename e como trocar `js-essential-kit` → `@zeeptech/toolkit` (é troca de nome de pacote, imports internos como `import { calculateAge } from '...'` não mudam — só o especificador do pacote).

## O que NÃO muda nesta etapa

- Estrutura interna do código (`lib/dates`, `lib/validators` etc.) — sem refatoração de organização de módulos aqui.
- Não separa BR-specific de genérico (decisão explícita acima).
- Não migra para ESM/dual-build nem adiciona subpath exports — fica para uma iniciativa separada de "profissionalização" da lib (release discipline, exports map, CI de segurança), fora do escopo deste rename.

## Migração dos projetos consumidores

O dono usa esta lib em vários projetos próprios. Escopo desta spec cobre só o rename da lib em si — a spec não lista quais/quantos projetos consomem `js-essential-kit` hoje (não levantado). Ação de acompanhamento, fora deste documento: depois do rename publicado, cada projeto consumidor precisa trocar a dependência (`package.json` + lockfile) de `js-essential-kit` para `@zeeptech/toolkit`, sem mudança de código de import além do nome do pacote.

## Fora de escopo / próximos passos (não fazer agora)

Da análise de "lib profissional" anterior, itens que continuam pendentes e não fazem parte deste rename:

- Disciplina de release (changesets/semantic-release, CHANGELOG automático).
- Build dual ESM+CJS + `exports` map / subpath exports.
- Zerar alertas de segurança abertos no Dependabot (7 hoje: 3 high, 4 medium).
- Atualizar `engines.node` (hoje `>=16`, desatualizado frente ao Node real testado em CI).
- Documentação de referência gerada (TypeDoc) e `CONTRIBUTING.md` com convenções reais (commit, lint, filosofia de erro dos validadores).
