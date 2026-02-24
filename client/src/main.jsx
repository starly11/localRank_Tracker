import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { queryClient } from './lib/queryClient'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import './index.css'
import { App } from './App.jsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111111',
            color: '#FFFFFF',
            border: '1px solid #27272A',
          },
        }}
      />
    </StrictMode>,
  </QueryClientProvider>
)
