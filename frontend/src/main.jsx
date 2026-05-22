import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12121a',
            color: '#e5e7eb',
            border: '2px solid #2a2a3a',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            borderRadius: '0',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
