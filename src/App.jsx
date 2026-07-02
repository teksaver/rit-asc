import { ProgressiveInput } from './components/ProgressiveInput'
import { TaskList } from './components/TaskList'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Dépôt</h1>
      </header>
      <TaskList />
      <ProgressiveInput />
    </div>
  )
}

export default App
