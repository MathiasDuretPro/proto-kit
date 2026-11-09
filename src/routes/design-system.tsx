import { Link } from 'react-router'
import { figmaRefs, registry } from './registry'
import { TokenTable } from './token-table'

/**
 * Design system showcase: every component and block, each state next to its
 * Figma capture, plus the semantic tokens. Tooling page: it is intentionally
 * unstyled (plain HTML) so it never imposes a look on the project.
 */
export default function DesignSystem() {
  const groups = [
    { kind: 'component', title: 'Components' },
    { kind: 'block', title: 'Blocks' },
  ] as const

  return (
    <main>
      <h1>Design system</h1>
      <p>
        <Link to="/_index">Back to prototype index</Link>
      </p>

      {groups.map(({ kind, title }) => {
        const entries = registry.filter((e) => e.kind === kind)
        return (
          <section key={kind} aria-labelledby={`ds-${kind}`}>
            <h2 id={`ds-${kind}`}>{title}</h2>
            {entries.length === 0 && <p>None yet.</p>}
            {entries.map((entry) => (
              <article key={entry.meta.name} aria-labelledby={`ds-${entry.meta.name}`}>
                <h3 id={`ds-${entry.meta.name}`}>{entry.meta.name}</h3>
                {entry.meta.description && <p>{entry.meta.description}</p>}
                {entry.meta.figma && (
                  <p>
                    <a href={entry.meta.figma}>Open in Figma</a>
                  </p>
                )}
                <table>
                  <thead>
                    <tr>
                      <th scope="col">State</th>
                      <th scope="col">Code</th>
                      <th scope="col">Figma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(entry.states).map(([state, render]) => {
                      const ref = figmaRefs[`${entry.meta.name}--${state}`]
                      return (
                        <tr key={state}>
                          <th scope="row">
                            <Link to={`/render/${entry.meta.name}/${state}`}>{state}</Link>
                          </th>
                          <td>{render()}</td>
                          <td>
                            {ref ? (
                              <img src={ref} alt={`Figma reference: ${entry.meta.name}, ${state}`} />
                            ) : (
                              'No capture'
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </article>
            ))}
          </section>
        )
      })}

      <section aria-labelledby="ds-tokens">
        <h2 id="ds-tokens">Semantic tokens</h2>
        <TokenTable />
      </section>
    </main>
  )
}
