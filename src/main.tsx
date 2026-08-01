import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/lora/600.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'

import './styles/tokens.css'
import './styles/app.css'

import { App } from './App'

const container = document.getElementById('root')
if (!container) throw new Error('root element is missing')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
