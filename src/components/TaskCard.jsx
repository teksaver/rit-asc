import { useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { db } from '../db'
import { TaskEnrichment, PRIORITY_OPTIONS } from './TaskEnrichment'
import './TaskCard.css'

const SWIPE_OPEN_THRESHOLD = 60

export function TaskCard({ task, categoriesMap }) {
  const [isEnrichmentOpen, setIsEnrichmentOpen] = useState(false)
  const swipeStartXRef = useRef(null)
  const swipeStartYRef = useRef(null)

  const isCompleted = task.status === 'completed'

  const category = task.categoryId && categoriesMap ? categoriesMap[task.categoryId] : undefined
  const priorityLabel = PRIORITY_OPTIONS.find((option) => option.value === task.priority)?.label

  const toggleCompleted = () => {
    db.tasks
      .update(task.id, { status: isCompleted ? 'inbox' : 'completed' })
      .catch(() => {
        // Échec silencieux tolérable : useLiveQuery reflète l'état réel de la base,
        // la case à cocher ne changera simplement pas si l'écriture a échoué.
      })
  }

  const toggleChecklistItem = (itemId) => {
    const updatedChecklist = (task.checklist ?? []).map((item) =>
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item,
    )
    db.tasks.update(task.id, { checklist: updatedChecklist }).catch(() => {
      // Échec silencieux tolérable, comme pour le statut de la tâche ci-dessus.
    })
  }

  const isInteractiveTarget = (event) =>
    event.target.closest('button, input, a, label, [role="checkbox"], [role="button"]')

  const handlePointerDown = (event) => {
    if (!event.isPrimary || isInteractiveTarget(event)) return
    event.currentTarget.setPointerCapture(event.pointerId)
    swipeStartXRef.current = event.clientX
    swipeStartYRef.current = event.clientY
  }

  const handlePointerUp = (event) => {
    if (!event.isPrimary) return
    if (swipeStartXRef.current === null) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    const deltaX = event.clientX - swipeStartXRef.current
    const deltaY = event.clientY - swipeStartYRef.current
    swipeStartXRef.current = null
    swipeStartYRef.current = null
    if (Math.abs(deltaY) < 30) {
      if (deltaX >= SWIPE_OPEN_THRESHOLD) {
        setIsEnrichmentOpen(true)
      } else if (deltaX <= -SWIPE_OPEN_THRESHOLD && isEnrichmentOpen) {
        setIsEnrichmentOpen(false)
      }
    }
  }

  const handlePointerCancel = (event) => {
    if (!event.isPrimary || swipeStartXRef.current === null) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    swipeStartXRef.current = null
    swipeStartYRef.current = null
  }

  return (
    <li
      className="task-card"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
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
            <span
              className="task-card__tag"
              style={{ backgroundColor: category.color, color: 'var(--color-text-primary)' }}
            >
              {category.name}
            </span>
          )}
          {priorityLabel && <span className="task-card__tag">{priorityLabel}</span>}
        </div>
      )}

      {task.checklist?.length > 0 && (
        <ul
          className="task-card__checklist"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          {task.checklist.map((item) => (
            <li key={item.id} className="task-card__checklist-item">
              <label className="task-card__checklist-label">
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => toggleChecklistItem(item.id)}
                  className="task-card__checklist-checkbox"
                />
                <span
                  className={`task-card__checklist-text${
                    item.isCompleted ? ' task-card__checklist-text--done' : ''
                  }`}
                >
                  {item.text}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {isEnrichmentOpen && <TaskEnrichment task={task} />}
    </li>
  )
}
