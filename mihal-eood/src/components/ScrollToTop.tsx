import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Routers keep the scroll offset across navigations; pages should start at the top. */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
