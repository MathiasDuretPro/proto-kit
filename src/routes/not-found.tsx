import { Link } from 'react-router'

export default function NotFound() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>
        <Link to="/_index">Back to prototype index</Link>
      </p>
    </main>
  )
}
