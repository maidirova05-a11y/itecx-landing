import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/hero/Hero'
import { About } from './components/sections/About'
import { Mission } from './components/sections/Mission'
import { Formats } from './components/sections/Formats'
import { Stages } from './components/sections/Stages'
import { ItalyDeepDive } from './components/sections/ItalyDeepDive'
import { Requirements } from './components/sections/Requirements'
import { GuideTeaser } from './components/sections/GuideTeaser'
import { Faq } from './components/sections/Faq'
import { Apply } from './components/sections/Apply'
import { useLanguage } from './i18n'

function App() {
  const { content, switching } = useLanguage()

  return (
    <div
      style={{
        opacity: switching ? 0 : 1,
        transition: 'opacity 200ms var(--ease-micro)',
      }}
    >
      <a href="#main-content" className="skip-link">
        {content.ui.skipLink}
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <About />
        <Mission />
        <Formats />
        <Stages />
        <ItalyDeepDive />
        <Requirements />
        <GuideTeaser />
        <Faq />
        <Apply />
      </main>
      <Footer />
    </div>
  )
}

export default App
