import { useEffect, useState } from 'react'
import { ProgressiveInput } from './components/ProgressiveInput'
import { TaskList } from './components/TaskList'
import { ConfigurationView } from './components/ConfigurationView'
import './App.css'

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function viewFromHash(hash) {
  return hash === '#/configuration' ? 'configuration' : 'depot'
}

function App() {
  const [view, setView] = useState(() => viewFromHash(window.location.hash))

  useEffect(() => {
    const handleHashChange = () => setView(viewFromHash(window.location.hash))
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (nextView) => {
    const nextHash = nextView === 'configuration' ? '#/configuration' : '#/'
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">{view === 'depot' ? 'Dépôt' : 'Configuration'}</h1>
        <nav className="app__nav" aria-label="Navigation principale">
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
        </nav>
      </header>
      <main className="app__main">
        {view === 'depot' ? (
          <>
            <TaskList />
            <ProgressiveInput />
          </>
        ) : (
          <ConfigurationView />
        )}
      </main>
    </div>
  )
}

export default App
