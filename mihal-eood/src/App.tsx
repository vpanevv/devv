import { useEffect } from 'react'
import Nav from './sections/Nav'
import Hero from './sections/Hero'

const LANDING_TITLE = 'МИХАЛ ЕООД — Качествен сух дървен материал'

export default function App() {
  // Each route owns the title, otherwise it keeps whatever the last page set.
  useEffect(() => {
    document.title = LANDING_TITLE
  }, [])

  return (
    <>
      <Nav />
      <main id="top" className="bg-timber-bark">
        <Hero />
      </main>
    </>
  )
}
