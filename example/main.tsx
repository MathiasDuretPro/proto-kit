import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useParams } from 'react-router'
import './index.css'
import { meta, states } from './button.states'

function Render() {
  const { name, state = '' } = useParams()
  const render = name === meta.name ? states[state as keyof typeof states] : undefined
  return (
    <main>
      <h1 className="sr-only">{`${name}, ${state}`}</h1>
      {render ? <div data-capture="" className="inline-block">{render()}</div> : <p>Not found</p>}
    </main>
  )
}

const router = createBrowserRouter([{ path: '/render/:name/:state', element: <Render /> }])
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
