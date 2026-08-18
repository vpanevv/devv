import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../sections/Nav'
import TintedBackdrop from '../components/TintedBackdrop'
import CardCarousel, { type Card } from '../components/CardCarousel'

const CARDS: Card[] = [
  {
    image: '/images/1.jpg',
    text: 'Михал ЕООД е създаден през 2008 год. като съставна дейност на фирмата е търговия със сух дървен материал.',
  },
  {
    image: '/images/2.jpg',
    text: 'В сферата на търговията имаме 10 годишен опит като стремежа ни е бил винаги да задоволяваме изискванията на клиента.Михал ЕООД е създаден през 2008 год. като съставна дейност на фирмата е търговия със сух дървен материал. В сферата на търговията имаме 10 годишен опит като стремежа ни е бил винаги да задоволяваме изискванията на клиента.',
  },
  {
    image: '/images/3.jpg',
    text: 'Фирмата разполага със складова база, собствен транспорт, подемна техника. Услугите, които извършваме са продажба на сух дървен материал, челни дъски, дюшеме, сачак за обшивка (тесен и широк), обшивка дървена (тясна и широка), дървен материал от дебелини от 2,5 до 10 см.',
  },
  {
    image: '/images/4.jpg',
    text: 'Фирмата разполага с постоянни количества от дървен материал от сушилна като престоя след сушилната е един месец преди да влезе в продажба. Фирмата осигурява транспорт в рамките на страната.',
  },
  {
    image: '/images/5.jpg',
    text: 'Наши основни клиенти са големи строителни фирми от района, фирми за производство на мебели, частни клиенти. Фирмата е предпочитан доставчик, заради коректността, конкурентната цена и съобразяване с изискванията на клиента.',
  },
]

export default function About() {
  useEffect(() => {
    document.title = 'За нас — МИХАЛ ЕООД'
  }, [])

  return (
    <>
      <Nav />

      {/* Backdrop is fixed so the cards move over a still photograph.
          Kept at z-0 with the content lifted above it — a negative z-index
          drops it behind the root stacking context and it stops painting
          once the page scrolls. */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-timber-bark">
        <TintedBackdrop src="/images/about-us.jpg" strength="copy" />
      </div>

      <main className="relative z-10 min-h-svh pb-20 pt-32 md:px-8 md:pb-28 md:pt-44">
        {/* The visible headline is gone, but the page still needs one heading. */}
        <h1 className="sr-only">За нас</h1>

        <div className="fade-up mx-auto max-w-[900px]">
          <CardCarousel cards={CARDS} label="За нас" />

          <div className="mt-14 flex justify-center px-[9vw] md:mt-16 md:px-0">
            <Link to="/" className="cta-button cta-button--sm font-sans uppercase tracking-[0.18em]">
              <span>Назад</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
