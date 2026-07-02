import { db } from '../db'
import './TaskCard.css'

export function TaskCard({ task }) {
  const isCompleted = task.status === 'completed'

  const toggleCompleted = () => {
    db.tasks
      .update(task.id, { status: isCompleted ? 'inbox' : 'completed' })
      .catch(() => {
        // Échec silencieux tolérable : useLiveQuery reflète l'état réel de la base,
        // la case à cocher ne changera simplement pas si l'écriture a échoué.
      })
  }

  return (
    <li className="task-card">
      <span
        role="checkbox"
        tabIndex={0}
        aria-checked={isCompleted}
        className={`task-card__checkbox${isCompleted ? ' task-card__checkbox--checked' : ''}`}
        onClick={toggleCompleted}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggleCompleted()
          }
        }}
        aria-label={isCompleted ? 'Marquer comme à faire' : 'Marquer comme terminée'}
      />
      <span className={`task-card__title${isCompleted ? ' task-card__title--done' : ''}`}>
        {task.title}
      </span>
    </li>
  )
}
