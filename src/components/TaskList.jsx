import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { TaskCard } from './TaskCard'
import './TaskList.css'

export function TaskList() {
  const tasks = useLiveQuery(
    () =>
      db.tasks
        .where('status')
        .equals('inbox')
        .toArray()
        .then((results) =>
          results.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0)),
        )
        .catch(() => 'error'),
    [],
    undefined,
  )

  const categories = useLiveQuery(() => db.categories.toArray(), [], [])
  const categoriesMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat
    return acc
  }, {})

  if (tasks === undefined) {
    return (
      <div className="task-list task-list--empty">
        <p>Chargement de votre dépôt…</p>
      </div>
    )
  }

  if (tasks === 'error') {
    return (
      <div className="task-list task-list--empty">
        <p>Impossible de charger vos tâches pour le moment. Réessayez un peu plus tard.</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="task-list task-list--empty">
        <p>Votre dépôt est vide. Videz-vous l'esprit ci-dessous.</p>
      </div>
    )
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} categoriesMap={categoriesMap} />
      ))}
    </ul>
  )
}
