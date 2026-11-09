import { useParams } from 'react-router'
import { findEntry } from './registry'

/**
 * Renders one state of one component or block, alone, for visual-diff.
 * The element marked data-capture is what gets screenshotted.
 */
export default function Render() {
  const { name = '', state = '' } = useParams()
  const render = findEntry(name)?.states[state]
  if (!render) {
    return (
      <main>
        <h1>Not found</h1>
        <p>
          No state "{state}" for "{name}".
        </p>
      </main>
    )
  }
  return (
    <main>
      <h1 className="sr-only">
        {name}, {state}
      </h1>
      <div data-capture="" className="inline-block">
        {render()}
      </div>
    </main>
  )
}
