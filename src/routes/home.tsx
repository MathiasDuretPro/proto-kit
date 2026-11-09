import { Link } from 'react-router'
import { screens } from './manifest'

/** Tooling index: links to every screen and to the design system. Unstyled on purpose. */
export default function Home() {
  return (
    <main>
      <h1>Prototype</h1>
      <nav aria-label="Prototype">
        <ul>
          <li>
            <Link to="/design-system">Design system</Link>
          </li>
          {screens.map((s) => (
            <li key={s.id}>
              <Link to={s.path}>{s.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
      {screens.length === 0 && <p>No screen yet. Start with phase 0 (skill: figma-inventory).</p>}
    </main>
  )
}
