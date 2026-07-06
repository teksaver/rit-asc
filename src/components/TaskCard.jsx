import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { db, UNASSIGNED_PLANNED_DAY_ID } from '../db'
import { TaskEnrichment, PRIORITY_OPTIONS } from './TaskEnrichment'
import './TaskCard.css'

const SWIPE_OPEN_THRESHOLD = 60
// Au-delà de ce déplacement vertical, un geste "draggable" est interprété comme
// un décollement de la carte plutôt qu'un swipe horizontal (édition/désaffectation).
// Volontairement bien au-dessus de SWIPE_DECIDE_THRESHOLD : un swipe horizontal réel
// dérive souvent de quelques pixels verticalement, un écart trop faible entre les deux
// seuils faisait basculer ces swipes en drag par erreur.
const DRAG_VERTICAL_THRESHOLD = 24
const SWIPE_DECIDE_THRESHOLD = 10
const LONG_PRESS_MS = 350
const STAGNATION_THRESHOLD_MS = 48 * 60 * 60 * 1000
// La carte reste montée sans re-render tant que rien d'autre ne change en base ;
// sans ce tick périodique, une tâche qui franchit le seuil de 48h pendant que
// l'app reste ouverte ne ferait apparaître l'indicateur qu'au prochain re-render
// fortuit (ex: modification d'une autre tâche).
const STAGNATION_RECHECK_INTERVAL_MS = 15 * 60 * 1000

function resolveDropTarget(clientX, clientY) {
  const el = document.elementFromPoint(clientX, clientY)
  const blockEl = el?.closest?.('[data-time-block]')
  return blockEl?.dataset.timeBlock ?? null
}

export function TaskCard({
  task,
  categoriesMap,
  draggable = false,
  onDrop,
  onDragOver,
  onUnassign,
  assignOptions,
  onAssign,
  disabled = false,
}) {
  const [isEnrichmentOpen, setIsEnrichmentOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const swipeStartXRef = useRef(null)
  const swipeStartYRef = useRef(null)
  const gestureModeRef = useRef(null)
  const longPressTimerRef = useRef(null)

  const isCompleted = task.status === 'completed'
  const isAssignedToBlock = Boolean(task.timeBlockId)
  const isInDepot =
    !isCompleted && !isAssignedToBlock && (!task.plannedDayId || task.plannedDayId === UNASSIGNED_PLANNED_DAY_ID)

  const [, recheckStagnation] = useState(0)
  useEffect(() => {
    const intervalId = setInterval(() => recheckStagnation((tick) => tick + 1), STAGNATION_RECHECK_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [])

  const isStagnant =
    isInDepot &&
    !task.categoryId &&
    Boolean(task.createdAt) &&
    Date.now() - new Date(task.createdAt).getTime() > STAGNATION_THRESHOLD_MS

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

  const toggleChecklistItem = async (itemId) => {
    try {
      await db.transaction('rw', db.tasks, async () => {
        const currentTask = await db.tasks.get(task.id)
        if (!currentTask) return
        const updatedChecklist = (currentTask.checklist ?? []).map((item) =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item,
        )
        await db.tasks.update(task.id, { checklist: updatedChecklist })
      })
    } catch (err) {
      console.error(err)
    }
  }

  const isInteractiveTarget = (event) => {
    const target = event.target.nodeType === 3 ? event.target.parentNode : event.target
    return target?.closest('button, input, select, a, label, [role="checkbox"], [role="button"]')
  }

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  useEffect(() => clearLongPressTimer, [])

  const beginDrag = () => {
    gestureModeRef.current = 'drag'
    setIsDragging(true)
  }

  const endDrag = (clientX, clientY) => {
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
    onDragOver?.(null)
    const blockId = resolveDropTarget(clientX, clientY)
    if (blockId && onDrop) {
      onDrop(task.id, blockId)
    }
  }

  const handlePointerDown = (event) => {
    if (!event.isPrimary || disabled || isInteractiveTarget(event)) return
    clearLongPressTimer()
    event.currentTarget.setPointerCapture(event.pointerId)
    swipeStartXRef.current = event.clientX
    swipeStartYRef.current = event.clientY
    gestureModeRef.current = null
    if (draggable) {
      longPressTimerRef.current = setTimeout(() => {
        if (gestureModeRef.current === null) beginDrag()
      }, LONG_PRESS_MS)
    }
  }

  const handlePointerMove = (event) => {
    if (!event.isPrimary || swipeStartXRef.current === null) return
    const deltaX = event.clientX - swipeStartXRef.current
    const deltaY = event.clientY - swipeStartYRef.current

    if (gestureModeRef.current === null) {
      if (draggable && Math.abs(deltaY) > DRAG_VERTICAL_THRESHOLD) {
        clearLongPressTimer()
        beginDrag()
      } else if (Math.abs(deltaX) > SWIPE_DECIDE_THRESHOLD && Math.abs(deltaY) <= DRAG_VERTICAL_THRESHOLD) {
        clearLongPressTimer()
        gestureModeRef.current = 'swipe'
      }
    }

    if (gestureModeRef.current === 'drag') {
      setDragOffset({ x: deltaX, y: deltaY })
      onDragOver?.(resolveDropTarget(event.clientX, event.clientY))
    } else if (gestureModeRef.current === 'swipe') {
      setIsSwiping(true)
      setSwipeOffset(deltaX)
    }
  }

  const handlePointerUp = (event) => {
    if (!event.isPrimary) return
    if (swipeStartXRef.current === null) return
    clearLongPressTimer()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    const deltaX = event.clientX - swipeStartXRef.current
    const deltaY = event.clientY - swipeStartYRef.current
    const mode = gestureModeRef.current
    swipeStartXRef.current = null
    swipeStartYRef.current = null
    gestureModeRef.current = null
    setIsSwiping(false)
    setSwipeOffset(0)

    if (mode === 'drag') {
      endDrag(event.clientX, event.clientY)
      return
    }

    if (Math.abs(deltaY) < 30) {
      if (deltaX >= SWIPE_OPEN_THRESHOLD) {
        setIsEnrichmentOpen(true)
      } else if (deltaX <= -SWIPE_OPEN_THRESHOLD) {
        if (isEnrichmentOpen) {
          setIsEnrichmentOpen(false)
        } else if (isAssignedToBlock && onUnassign) {
          onUnassign(task.id)
        }
      }
    }
  }

  const handlePointerCancel = (event) => {
    if (!event.isPrimary || swipeStartXRef.current === null) return
    clearLongPressTimer()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (gestureModeRef.current === 'drag') {
      setIsDragging(false)
      setDragOffset({ x: 0, y: 0 })
      onDragOver?.(null)
    }
    setIsSwiping(false)
    setSwipeOffset(0)
    swipeStartXRef.current = null
    swipeStartYRef.current = null
    gestureModeRef.current = null
  }

  return (
    <li
      className={`task-card${draggable ? ' task-card--draggable' : ''}${
        isDragging ? ' task-card--dragging' : ''
      }${isSwiping ? ' task-card--swiping' : ''}`}
      style={
        isDragging
          ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }
          : isSwiping
            ? { transform: `translateX(${swipeOffset}px)` }
            : undefined
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
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
          className={`task-card__edit-button${isStagnant ? ' task-card__edit-button--stagnant' : ''}`}
          aria-label={isStagnant ? 'Modifier la tâche (catégorie suggérée)' : 'Modifier la tâche'}
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

      {isAssignedToBlock && onUnassign && (
        <div
          className="task-card__footer"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="task-card__unassign-button"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation()
              onUnassign(task.id)
            }}
          >
            Retirer
          </button>
        </div>
      )}

      {!isAssignedToBlock && assignOptions?.length > 0 && (
        <div
          className="task-card__footer"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          <label className="task-card__assign-label" htmlFor={`task-card__assign-select-${task.id}`}>
            Affecter à
          </label>
          <select
            id={`task-card__assign-select-${task.id}`}
            className="task-card__assign-select"
            defaultValue=""
            disabled={disabled}
            onChange={(event) => {
              const blockId = event.target.value
              if (blockId) onAssign?.(task.id, blockId)
              // Repoussé après le tour courant pour laisser le lecteur d'écran
              // annoncer la sélection avant qu'elle ne revienne au placeholder.
              const selectEl = event.target
              setTimeout(() => {
                selectEl.value = ''
              }, 0)
            }}
          >
            <option value="" disabled>
              Choisir une plage…
            </option>
            {assignOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </li>
  )
}
