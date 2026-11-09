import { useState } from 'react'

type Token = { name: string; value: string }

/** Reads the semantic custom properties declared on :root (src/tokens/semantic.css). */
function readSemanticTokens(): Token[] {
  const names = new Set<string>()
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    const walk = (list: CSSRuleList) => {
      for (const rule of Array.from(list)) {
        if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
          for (const prop of Array.from(rule.style)) {
            if (prop.startsWith('--') && !prop.startsWith('--primitive-') && !prop.startsWith('--tw-')) names.add(prop)
          }
        } else if ('cssRules' in rule) {
          walk((rule as CSSGroupingRule).cssRules)
        }
      }
    }
    walk(rules)
  }
  const computed = getComputedStyle(document.documentElement)
  return [...names].sort().map((name) => ({ name, value: computed.getPropertyValue(name).trim() }))
}

export function TokenTable() {
  // Stylesheets are loaded before the first render (imported in main.tsx).
  const [tokens] = useState<Token[]>(readSemanticTokens)

  if (tokens.length === 0) return <p>No semantic token yet (skill: extract-tokens).</p>
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Token</th>
          <th scope="col">Resolved value</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((t) => (
          <tr key={t.name}>
            <td>
              <code>{t.name}</code>
            </td>
            <td>
              <code>{t.value}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
