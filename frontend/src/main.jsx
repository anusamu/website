import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify' // 1. Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'  // 2. Import global CSS styles
import './index.css'
import { CartProvider } from './components/Context/CartContext.jsx'
import { WishlistProvider } from './components/Context/WishlistContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WishlistProvider>
    <CartProvider>
    <BrowserRouter>
      <App />
      {/* 3. Inject the ToastContainer component */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
     </CartProvider>
     </WishlistProvider>

  </React.StrictMode>,
)