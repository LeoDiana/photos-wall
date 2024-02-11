import { createBrowserRouter } from 'react-router-dom';
import PATHS from './paths.ts';
import App from '../App.tsx';

const router =  createBrowserRouter([{
  path: PATHS.walls._anyOne,
  element: <App />
}, {
  path: '*',
  element: <App />,
},])

export default router