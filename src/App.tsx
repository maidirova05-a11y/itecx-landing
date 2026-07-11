import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/hero/Hero'
import { VisionMission } from './components/sections/VisionMission'
import { Goals } from './components/sections/Goals'
import { About } from './components/sections/About'
import { Formats } from './components/sections/Formats'
import { Stages } from './components/sections/Stages'
import { ItalyDeepDive } from './components/sections/ItalyDeepDive'
import { Format } from './components/sections/Format'
import { Rules } from './components/sections/Rules'
import { Criteria } from './components/sections/Criteria'
import { Process } from './components/sections/Process'
import { ProjectJourney } from './components/sections/ProjectJourney'
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
        <VisionMission />
        <Goals />
        <About />
        <Formats />
        <Stages />
        <ItalyDeepDive />
        <Format />
        <Rules />
        <Criteria />
        <Process />
        <ProjectJourney />
        <Apply />
      </main>
      <Footer />
    </div>
  )
}

export default App
