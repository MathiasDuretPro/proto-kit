import { StrictMode, lazy, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider, type RouteObject } from 'react-router'
import './index.css'
import { screens } from './routes/manifest'
import { screenModules } from './routes/registry'
import Home from './routes/home'
import DesignSystem from './routes/design-system'
import Render from './routes/render'
import NotFound from './routes/not-found'

const screenRoutes: RouteObject[] = screens.map((screen) => {
  const load = screenModules[`../screens/${screen.id}.tsx`]
  if (!load) throw new Error(`Screen "${screen.id}" is in the manifest but src/screens/${screen.id}.tsx is missing.`)
  const Screen = lazy(load as () => Promise<{ default: ComponentType }>)
  return { path: screen.path, element: <Screen /> }
})

const router = createBrowserRouter([
  ...screenRoutes,
  { path: '/_index', element: <Home /> },
  // '/' shows the index until a screen claims it in the manifest.
  { path: '/', element: <Navigate to="/_index" replace /> },
  { path: '/design-system', element: <DesignSystem /> },
  { path: '/render/:name/:state', element: <Render /> },
  { path: '*', element: <NotFound /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
