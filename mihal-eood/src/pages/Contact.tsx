import { useEffect, useRef, useState } from 'react'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import TintedBackdrop from '../components/TintedBackdrop'

const RECIPIENT = 'mihaleood@gmail.com'
const MAP_ADDRESS = 'Разлог, ул. Христо Ботев 71, България'

/**
 * Set this to a form-backend URL (Formspree, Web3Forms, or your own handler)
 * and the form POSTs to it instead of opening the visitor's mail client.
 * Left null, submission falls back to a prefilled mailto: to RECIPIENT —
 * the only way a static site can reach an inbox with no server.
 */
const FORM_ENDPOINT: string | null = null

type Fields = {
  name: string
  email: string
  subject: string
  message: string
  human: boolean
}

type Errors = Partial<Record<keyof Fields, string>>

const EMPTY: Fields = { name: '', email: '', subject: '', message: '', human: false }

// Deliberately permissive: anything with a local part, an @, and a dotted domain.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(values: Fields): Errors {
  const errors: Errors = {}
  if (values.name.trim().length < 2) errors.name = 'Моля, въведете име (поне 2 символа).'
  if (!values.email.trim()) errors.email = 'Моля, въведете е-мейл.'
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Моля, въведете валиден е-мейл адрес.'
  if (values.subject.trim().length < 3) errors.subject = 'Моля, въведете тема (поне 3 символа).'
  if (values.message.trim().length < 10)
    errors.message = 'Моля, опишете запитването си (поне 10 символа).'
  if (!values.human) errors.human = 'Моля, потвърдете, че не сте робот.'
  return errors
}

const fieldClass =
  'w-full rounded-xl border bg-white/5 px-4 py-3 font-sans text-[0.95rem] font-light text-timber-cream placeholder:text-timber-cream/35 transition-colors focus:outline-none focus:ring-2 focus:ring-timber-sap/60'
const labelClass =
  'block font-sans text-[0.68rem] font-medium uppercase tracking-[0.22em] text-timber-sap'

export default function Contact() {
  const [values, setValues] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  // Bots fill every field they find; humans never see this one.
  const honeypot = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = 'Контакти — МИХАЛ ЕООД'
  }, [])

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    const next = { ...values, [key]: value }
    setValues(next)
    // Only re-validate live once they have tried to submit, so the form does
    // not shout at someone still filling in the first field.
    if (submitted) setErrors(validate(next))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setFailed(null)

    if (honeypot.current?.value) return // silently drop bot submissions

    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>('[data-error="true"]')?.focus()
      return
    }

    if (FORM_ENDPOINT) {
      setSending(true)
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...values, to: RECIPIENT }),
        })
        if (!res.ok) throw new Error(String(res.status))
        setSent(true)
        setValues(EMPTY)
        setSubmitted(false)
      } catch {
        setFailed('Съобщението не беше изпратено. Опитайте отново или ни пишете директно.')
      } finally {
        setSending(false)
      }
      return
    }

    const body = `Име: ${values.name}\nЕ-мейл: ${values.email}\n\n${values.message}\n`
    window.location.href = `mailto:${RECIPIENT}?subject=${encodeURIComponent(
      values.subject,
    )}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  const borderFor = (key: keyof Fields) =>
    errors[key] ? 'border-red-400/70' : 'border-white/15 focus:border-timber-sap'

  return (
    <>
      <Nav />

      <div className="fixed inset-0 z-0 overflow-hidden bg-timber-bark">
        <TintedBackdrop src="/images/services.jpg" strength="dark" />
      </div>

      <main className="relative z-10 px-4 pb-20 pt-32 md:px-8 md:pb-28 md:pt-44">
        <div className="mx-auto max-w-3xl">
          <h1 className="sr-only">Контакти</h1>

          <form
            noValidate
            onSubmit={onSubmit}
            className="liquid-glass-panel fade-up rounded-3xl px-6 py-10 md:px-12 md:py-14"
          >
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.24em] text-timber-sap">
              Пишете ни
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-[0.95] text-white md:text-5xl">
              Свържете се с нас
            </h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-timber-sap/50 via-timber-sap/15 to-transparent" />

            {sent && (
              <p
                role="status"
                className="mt-8 rounded-xl border border-timber-sap/40 bg-timber-sap/10 px-4 py-3 font-sans text-[0.9rem] font-light text-timber-cream"
              >
                {FORM_ENDPOINT
                  ? 'Благодарим! Съобщението е изпратено.'
                  : 'Отваряме вашата пощенска програма с готово съобщение. Ако не се отвори, пишете ни на ' +
                    RECIPIENT}
              </p>
            )}

            {failed && (
              <p
                role="alert"
                className="mt-8 rounded-xl border border-red-400/50 bg-red-400/10 px-4 py-3 font-sans text-[0.9rem] font-light text-timber-cream"
              >
                {failed}
              </p>
            )}

            <div className="mt-8 space-y-6">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Име <span aria-hidden="true">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={values.name}
                  onChange={(e) => set('name', e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  data-error={!!errors.name}
                  placeholder="Вашето име"
                  className={`mt-3 ${fieldClass} ${borderFor('name')}`}
                />
                {errors.name && (
                  <p id="name-error" className="mt-2 font-sans text-[0.8rem] text-red-300">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Е-мейл <span aria-hidden="true">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={values.email}
                  onChange={(e) => set('email', e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  data-error={!!errors.email}
                  placeholder="ime@primer.bg"
                  className={`mt-3 ${fieldClass} ${borderFor('email')}`}
                />
                {errors.email && (
                  <p id="email-error" className="mt-2 font-sans text-[0.8rem] text-red-300">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className={labelClass}>
                  Тема <span aria-hidden="true">*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={values.subject}
                  onChange={(e) => set('subject', e.target.value)}
                  aria-invalid={!!errors.subject}
                  aria-describedby={errors.subject ? 'subject-error' : undefined}
                  data-error={!!errors.subject}
                  placeholder="Запитване за дървен материал"
                  className={`mt-3 ${fieldClass} ${borderFor('subject')}`}
                />
                {errors.subject && (
                  <p id="subject-error" className="mt-2 font-sans text-[0.8rem] text-red-300">
                    {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className={labelClass}>
                  Съобщение <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  value={values.message}
                  onChange={(e) => set('message', e.target.value)}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  data-error={!!errors.message}
                  placeholder="Какви количества и размери ви трябват?"
                  className={`mt-3 resize-y ${fieldClass} ${borderFor('message')}`}
                />
                {errors.message && (
                  <p id="message-error" className="mt-2 font-sans text-[0.8rem] text-red-300">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Honeypot — hidden from people, irresistible to bots. */}
              <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                <label htmlFor="company">Фирма</label>
                <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" ref={honeypot} />
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={values.human}
                    onChange={(e) => set('human', e.target.checked)}
                    aria-invalid={!!errors.human}
                    aria-describedby={errors.human ? 'human-error' : undefined}
                    data-error={!!errors.human}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-white/25 bg-white/5 text-timber-sap accent-timber-sap focus:outline-none focus:ring-2 focus:ring-timber-sap/60"
                  />
                  <span className="font-sans text-[0.9rem] font-light leading-snug text-timber-cream/85">
                    Не съм робот <span aria-hidden="true">*</span>
                  </span>
                </label>
                {errors.human && (
                  <p id="human-error" className="mt-2 font-sans text-[0.8rem] text-red-300">
                    {errors.human}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-10">
              <button
                type="submit"
                disabled={sending}
                className="cta-button font-sans uppercase tracking-[0.18em] disabled:cursor-wait disabled:opacity-60"
              >
                <span>{sending ? 'Изпращане…' : 'Изпрати'}</span>
              </button>
            </div>

            <p className="mt-6 font-sans text-[0.78rem] font-light text-timber-cream/50">
              Полетата, отбелязани със <span aria-hidden="true">*</span>, са задължителни.
            </p>
          </form>

          {/* Map */}
          <section
            aria-label="Локация"
            className="liquid-glass-panel fade-up mt-8 overflow-hidden rounded-3xl"
            style={{ animationDelay: '0.15s' }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3 px-6 py-6 md:px-10">
              <h2 className="font-sans text-[0.68rem] uppercase tracking-[0.22em] text-timber-sap">
                Намерете ни
              </h2>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_ADDRESS)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link relative font-sans text-[0.85rem] font-light text-timber-cream/85 transition-colors hover:text-white"
              >
                Отвори в Google Maps
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-timber-sap transition-transform duration-500 ease-out group-hover/link:origin-left group-hover/link:scale-x-100" />
              </a>
            </div>
            <iframe
              title="Карта — гр. Разлог, ул. Христо Ботев 71"
              src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_ADDRESS)}&hl=bg&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[320px] w-full border-0 md:h-[420px]"
            />
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
