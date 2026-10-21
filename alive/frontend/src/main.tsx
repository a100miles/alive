import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/cutive-mono/latin-400.css'
import '@fontsource/indie-flower/latin-400.css'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>)
