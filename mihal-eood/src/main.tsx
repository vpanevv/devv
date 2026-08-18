import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.tsx'
import About from './pages/About.tsx'
import Products from './pages/Products.tsx'
import Gallery from './pages/Gallery.tsx'
import ScrollToTop from './components/ScrollToTop.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/za-nas" element={<About />} />
        <Route path="/produkti" element={<Products />} />
        <Route path="/galeriya" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
