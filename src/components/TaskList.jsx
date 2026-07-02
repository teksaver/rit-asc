import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { TaskCard } from './TaskCard'
import './TaskList.css'

export function TaskList() {
  const tasks = useLiveQuery(
    () => db.tasks.orderBy('createdAt').reverse().toArray(),
    [],
    [],
  )

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
        <TaskCard key={task.id} task={task} />
      ))}
    </ul>
  )
}
