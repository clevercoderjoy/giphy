import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider } from 'react-router-dom'
import router from './router/Routes.jsx'
import GifProvider from './context/GifContext.jsx'
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GifProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </GifProvider>
  </StrictMode>,
)
