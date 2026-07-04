import { useEffect, useState } from 'react'
import { ProgressiveInput } from './components/ProgressiveInput'
import { TaskList } from './components/TaskList'
import { ConfigurationView } from './components/ConfigurationView'
import { PlanningView } from './components/PlanningView'
import { TodayView } from './components/TodayView'
import './App.css'

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function viewFromHash(hash) {
  if (hash === '#/configuration') return 'configuration'
  if (hash === '#/planification') return 'planification'
  if (hash === '#/depot') return 'depot'
  if (hash === '#/' || hash === '#' || hash === '') return 'aujourdhui'
  return 'introuvable'
}

function App() {
  const [view, setView] = useState(() => viewFromHash(window.location.hash))

  useEffect(() => {
    const handleHashChange = () => setView(viewFromHash(window.location.hash))
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (nextView) => {
    const hashByView = {
      depot: '#/depot',
      configuration: '#/configuration',
      planification: '#/planification',
      aujourdhui: '#/',
    }
    const nextHash = hashByView[nextView] ?? '#/'
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash
    }
  }

  const titlesByView = {
    aujourdhui: "Aujourd'hui",
    depot: 'Dépôt',
    configuration: 'Configuration',
    planification: 'Planification',
    introuvable: 'Page introuvable',
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">{titlesByView[view]}</h1>
        <nav className="app__nav" aria-label="Navigation principale">
          <button
            type="button"
            className={cx('app__nav-button', view === 'aujourdhui' && 'app__nav-button--active')}
            aria-current={view === 'aujourdhui' ? 'page' : undefined}
            onClick={() => navigate('aujourdhui')}
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            className={cx('app__nav-button', view === 'depot' && 'app__nav-button--active')}
            aria-current={view === 'depot' ? 'page' : undefined}
            onClick={() => navigate('depot')}
          >
            Dépôt
          </button>
          <button
            type="button"
            className={cx('app__nav-button', view === 'configuration' && 'app__nav-button--active')}
            aria-current={view === 'configuration' ? 'page' : undefined}
            onClick={() => navigate('configuration')}
          >
            Configuration
          </button>
          <button
            type="button"
            className={cx('app__nav-button', view === 'planification' && 'app__nav-button--active')}
            aria-current={view === 'planification' ? 'page' : undefined}
            onClick={() => navigate('planification')}
          >
            Planification
          </button>
        </nav>
      </header>
      <main className="app__main">
        {view === 'aujourdhui' && <TodayView />}
        {view === 'depot' && (
          <>
            <TaskList />
            <ProgressiveInput />
          </>
        )}
        {view === 'configuration' && <ConfigurationView />}
        {view === 'planification' && <PlanningView />}
        {view === 'introuvable' && (
          <div className="app__not-found">
            <p>Cette page n'existe pas.</p>
            <a href="#/">Retour à Aujourd'hui</a>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
