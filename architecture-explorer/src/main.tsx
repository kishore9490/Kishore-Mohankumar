import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import '@xyflow/react/dist/style.css'

/**
 * The normal dev/build target uses BrowserRouter.
 *
 * The single-file build (`npm run build:singlefile`) has no server to rewrite
 * paths, so it uses HashRouter instead — that build is meant to be opened
 * directly from a file or embedded in a static host.
 */
const Router = import.meta.env.VITE_HASH_ROUTER === '1' ? HashRouter : BrowserRouter

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
)
