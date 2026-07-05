import { useEffect, useState } from 'react'
import { ProgressiveInput } from './components/ProgressiveInput'
import { TaskList } from './components/TaskList'
import { ConfigurationView } from './components/ConfigurationView'
import { PlanningView } from './components/PlanningView'
import { TodayView } from './components/TodayView'
import { db, resetDatabase } from './db'
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
  // 'opening' → 'ready' | 'error'. Gating the app on an explicit db.open() means
  // a failed open (e.g. an aborted migration) surfaces a recovery screen instead
  // of leaving every useLiveQuery hanging silently on a blank page.
  const [dbState, setDbState] = useState('opening')

  useEffect(() => {
    const handleHashChange = () => setView(viewFromHash(window.location.hash))
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    let cancelled = false
    db.open()
      .then(() => {
        if (!cancelled) setDbState('ready')
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setDbState('error')
      })
    return () => {
      cancelled = true
    }
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

  if (dbState === 'error') {
    return (
      <div className="app app--db-error">
        <div className="app__db-error" role="alert">
          <h1 className="app__db-error-title">Vos données n'ont pas pu être ouvertes</h1>
          <p className="app__db-error-text">
            La base de données locale de votre navigateur n'a pas pu être chargée. Vous pouvez la
            réinitialiser pour repartir sur une base saine.
          </p>
          <p className="app__db-error-text app__db-error-warning">
            Attention : cette action efface les données enregistrées sur cet appareil.
          </p>
          <button type="button" className="app__db-error-button" onClick={resetDatabase}>
            Réinitialiser les données
          </button>
        </div>
      </div>
    )
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
