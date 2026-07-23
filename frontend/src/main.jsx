import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import { CartProvider } from './components/Context/CartContext.jsx'
import { WishlistProvider } from './components/Context/WishlistContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WishlistProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
          <ToastContainer position="top-right" autoClose={3000} theme="light" />
        </BrowserRouter>
      </CartProvider>
    </WishlistProvider>
  </React.StrictMode>
);