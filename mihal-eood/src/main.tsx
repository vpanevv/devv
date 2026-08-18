import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.tsx'
import About from './pages/About.tsx'
import Products from './pages/Products.tsx'
import Gallery from './pages/Gallery.tsx'
import Contact from './pages/Contact.tsx'
import ScrollToTop from './components/ScrollToTop.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contacts" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
