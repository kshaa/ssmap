import React from 'react'
import { createRoot } from 'react-dom/client'
import 'normalize.css'
import App from '@src/components/App/App'
import registerServiceWorker from './registerServiceWorker'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<App />)

registerServiceWorker()
