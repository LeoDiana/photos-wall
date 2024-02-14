import { createBrowserRouter } from 'react-router-dom'

import App from '../App.tsx'

import PATHS from './paths.ts'

const router = createBrowserRouter([
  {
    path: PATHS.walls._anyOne,
    element: <App />,
  },
  {
    path: '*',
    element: <App />,
  },
])

export default router
