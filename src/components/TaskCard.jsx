import { db } from '../db'
import './TaskCard.css'

export function TaskCard({ task }) {
  const isDone = task.status === 'done'

  const toggleDone = () => {
    db.tasks.update(task.id, { status: isDone ? 'inbox' : 'done' })
  }

  return (
    <li className="task-card">
      <button
        type="button"
        className={`task-card__checkbox${isDone ? ' task-card__checkbox--checked' : ''}`}
        onClick={toggleDone}
        aria-label={isDone ? 'Marquer comme à faire' : 'Marquer comme terminée'}
        aria-pressed={isDone}
      />
      <span className={`task-card__title${isDone ? ' task-card__title--done' : ''}`}>
        {task.title}
      </span>
    </li>
  )
}
