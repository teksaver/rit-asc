import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { SlidersHorizontal } from 'lucide-react'
import { db } from '../db'
import { TaskEnrichment, PRIORITY_OPTIONS } from './TaskEnrichment'
import './TaskCard.css'

const SWIPE_OPEN_THRESHOLD = 60

export function TaskCard({ task }) {
  const [isEnrichmentOpen, setIsEnrichmentOpen] = useState(false)
  const swipeStartXRef = useRef(null)

  const isCompleted = task.status === 'completed'

  const category = useLiveQuery(
    () => (task.categoryId ? db.categories.get(task.categoryId) : undefined),
    [task.categoryId],
  )
  const priorityLabel = PRIORITY_OPTIONS.find((option) => option.value === task.priority)?.label

  const toggleCompleted = () => {
    db.tasks
      .update(task.id, { status: isCompleted ? 'inbox' : 'completed' })
      .catch(() => {
        // Échec silencieux tolérable : useLiveQuery reflète l'état réel de la base,
        // la case à cocher ne changera simplement pas si l'écriture a échoué.
      })
  }

  const handlePointerDown = (event) => {
    swipeStartXRef.current = event.clientX
  }

  const handlePointerUp = (event) => {
    if (swipeStartXRef.current === null) return
    const delta = event.clientX - swipeStartXRef.current
    swipeStartXRef.current = null
    if (delta >= SWIPE_OPEN_THRESHOLD) {
      setIsEnrichmentOpen(true)
    }
  }

  return (
    <li className="task-card" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
      <div className="task-card__row">
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
        <button
          type="button"
          className="task-card__edit-button"
          aria-label="Modifier la tâche"
          aria-expanded={isEnrichmentOpen}
          onClick={() => setIsEnrichmentOpen((open) => !open)}
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
        </button>
      </div>

      {(category || priorityLabel) && (
        <div className="task-card__tags">
          {category && (
            <span className="task-card__tag" style={{ backgroundColor: category.color }}>
              {category.name}
            </span>
          )}
          {priorityLabel && <span className="task-card__tag">{priorityLabel}</span>}
        </div>
      )}

      {isEnrichmentOpen && <TaskEnrichment task={task} />}
    </li>
  )
}
