# AGENTS.md

## Objetivo
- Este projeto implementa componentes de formulário em Web Components, com JavaScript vanilla, módulos ESM e sem dependência de framework.
- O Codex deve preservar essa proposta: código simples, extensível por configuração e consumível direto no navegador via `src/index.js`.

## Stack e arquitetura
- Usar apenas JavaScript ESM (`import`/`export`), compatível com o ambiente atual do projeto.
- Não introduzir TypeScript, bundlers, transpilers, frameworks UI ou dependências sem necessidade explícita.
- Manter a API principal baseada em custom elements:
  - `<form-input>` para campos.
  - `<form is="form-control">` para o wrapper de submit.
- Preservar o uso de `ElementInternals`, `attachShadow`, `formAssociated` e integração com `FormData`.
- Tratar `src/config.js` como ponto central de extensibilidade para:
  - `validations`
  - `inputs`
  - `masks`

## Convenções de código
- Seguir o estilo já dominante do repositório:
  - aspas simples
  - semicolon apenas quando já fizer sentido localmente; não reformatar o arquivo inteiro
  - nomes descritivos em inglês para classes, métodos e variáveis
  - exports nomeados para utilitários e classes
- Preferir funções pequenas e diretas, com lógica explícita.
- Evitar abstrações excessivas. Se a solução puder seguir o padrão já existente, seguir o padrão existente.
- Não reestruturar arquivos ou renomear APIs públicas sem necessidade clara.

## Padrões dos componentes
- Novos tipos de input devem seguir o contrato usado pelos componentes em `src/inputs/`:
  - receber `{ el, shadow, internals }` no `constructor`
  - montar o template via `template.innerHTML`
  - anexar no `shadow`
  - expor `this.formitem`
  - implementar `setError(error)`
- Quando fizer sentido, manter a estrutura de slots existente:
  - `before`
  - `label`
  - `prefix`
  - `input`
  - `suffix`
  - `help`
  - `errors`
  - `after`
- Reaproveitar classes CSS já existentes (`wc-form-*`) antes de criar novas convenções.
- Se um novo input for registrável, integrá-lo por `Config.registerInput(...)` ou pela tabela `inputs` em `src/config.js`.

## Padrões de validação e máscara
- Regras de validação devem continuar no formato atual:
  - `message: (...args) => string`
  - `handle: ({ value, params, el, values, rule }) => boolean`
- Validations string-based devem continuar compatíveis com o formato documentado no README:
  - `required|minlen:5|maxlen:128`
- Máscaras novas devem seguir a extensão por `Config.registerMask(...)`.
- Antes de criar novo mecanismo, verificar se a extensão cabe em `Config`.

## API pública e compatibilidade
- Preservar atributos documentados no README, como:
  - `name`
  - `type`
  - `label`
  - `help`
  - `validations`
  - `options`
  - `mask`
  - `mask:format`
  - `unmask`
- Evitar breaking changes em nomes de evento e comportamento observável.
- Se uma mudança alterar a API pública, atualizar o `README.md` no mesmo trabalho.

## Documentação
- Toda feature nova que afete uso do componente deve refletir o README.
- Exemplos do README devem continuar alinhados com o comportamento real do código.
- Se uma limitação conhecida for relevante para a mudança, documentá-la de forma objetiva.

## Testes
- Usar Vitest para testes automatizados.
- Ao alterar helpers, validações, parsing ou comportamento determinístico, adicionar ou ajustar testes em `tests/`.
- Seguir o padrão atual dos testes:
  - `describe(...)`
  - `test(...)`
  - `expect(...)`
- Priorizar testes de comportamento público, não detalhes internos desnecessários.

## Diretrizes para mudanças
- Fazer mudanças pequenas e localizadas.
- Não corrigir estilo de arquivos não relacionados apenas por preferência.
- Não remover código existente sem confirmar impacto na API e na documentação.
- Ao adicionar recurso novo, verificar este checklist:
  - implementação integrada ao fluxo atual
  - atualização de `Config` se necessário
  - documentação no `README.md`
  - teste cobrindo o caso principal

## O que evitar
- Não introduzir dependências de runtime sem pedido explícito.
- Não migrar a base para outra arquitetura.
- Não trocar a convenção attribute-driven dos componentes por uma API imperativa.
- Não criar helpers genéricos demais se o uso é local e simples.

## Resposta esperada do Codex em tarefas futuras
- Antes de propor refactors amplos, confirmar se o problema pode ser resolvido mantendo o padrão atual.
- Em tarefas de implementação, priorizar compatibilidade com o README e com `src/config.js`.
- Em tarefas de correção, considerar primeiro regressão de API pública, validação, máscara e submit.
