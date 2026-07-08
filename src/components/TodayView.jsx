import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, UNASSIGNED_PLANNED_DAY_ID } from '../db'
import { ensureOnboarding } from '../services/onboarding'
import { suggestTasksForBlock } from '../services/suggestionEngine'
import { TaskCard } from './TaskCard'
import './TodayView.css'

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' })
const DAY_MONTH_FORMATTER = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' })
const ISO_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function toISODate(date) {
  return ISO_DATE_FORMATTER.format(date)
}

function parseISODate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatTodayLabel(date) {
  const weekday = WEEKDAY_FORMATTER.format(date)
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  return `${capitalizedWeekday} ${DAY_MONTH_FORMATTER.format(date)}`
}

function millisecondsUntilNextMidnight() {
  const now = new Date()
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5)
  return nextMidnight.getTime() - now.getTime()
}

function useTodayISO() {
  const [todayISO, setTodayISO] = useState(() => toISODate(new Date()))

  useEffect(() => {
    let timeoutId
    const scheduleRefresh = () => {
      timeoutId = setTimeout(() => {
        setTodayISO(toISODate(new Date()))
        scheduleRefresh()
      }, millisecondsUntilNextMidnight())
    }
    scheduleRefresh()
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    // A sleeping device or a throttled background tab can miss the midnight
    // setTimeout entirely; re-sync as soon as the tab is visible again.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTodayISO(toISODate(new Date()))
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return todayISO
}

export function TodayView() {
  const todayISO = useTodayISO()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [onboardingDone, setOnboardingDone] = useState(false)
  const [hoveredBlockId, setHoveredBlockId] = useState(null)
  const [suggestionBlockId, setSuggestionBlockId] = useState(null)

  useEffect(() => {
    let cancelled = false
    ensureOnboarding().finally(() => {
      if (!cancelled) setOnboardingDone(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const plannedDay = useLiveQuery(
    () => db.plannedDays.where('date').equals(todayISO).first().then((result) => result ?? null),
    [todayISO],
  )
  const dayTemplate = useLiveQuery(
    () =>
      plannedDay
        ? db.dayTemplates.get(plannedDay.dayTemplateId).then((result) => result ?? null)
        : undefined,
    [plannedDay],
  )
  const timeBlocks = useLiveQuery(
    () =>
      plannedDay
        ? db.timeBlocks.where('dayTemplateId').equals(plannedDay.dayTemplateId).toArray()
        : Promise.resolve([]),
    [plannedDay],
    [],
  )
  const categories = useLiveQuery(() => db.categories.toArray(), [], [])
  const tasksForDay = useLiveQuery(
    () =>
      plannedDay
        ? db.tasks.where('plannedDayId').equals(plannedDay.id).toArray()
        : Promise.resolve([]),
    [plannedDay],
    [],
  )
  const inboxTasks = useLiveQuery(
    () => db.tasks.where('[status+plannedDayId]').equals(['inbox', UNASSIGNED_PLANNED_DAY_ID]).toArray(),
    [],
    [],
  )

  const categoriesById = useMemo(
    () =>
      categories.reduce((acc, category) => {
        acc[category.id] = category
        return acc
      }, {}),
    [categories],
  )

  const sortedTimeBlocks = useMemo(
    () =>
      [...timeBlocks].sort((a, b) =>
        a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0,
      ),
    [timeBlocks],
  )
  const timeBlockIds = useMemo(() => new Set(sortedTimeBlocks.map((block) => block.id)), [sortedTimeBlocks])
  const orphanedTasks = useMemo(
    () => tasksForDay.filter((task) => !timeBlockIds.has(task.timeBlockId)),
    [tasksForDay, timeBlockIds],
  )
  const safeInboxTasks = useMemo(() => inboxTasks ?? [], [inboxTasks])
  const sortedInboxTasks = useMemo(
    () =>
      [...safeInboxTasks].sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
      ),
    [safeInboxTasks],
  )
  const assignOptions = useMemo(
    () =>
      sortedTimeBlocks.map((block) => ({
        id: block.id,
        label: `${block.startTime} – ${block.endTime}`,
      })),
    [sortedTimeBlocks],
  )

  const assignTask = async (taskId, blockId) => {
    if (isSubmitting || !plannedDay || !blockId) return
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await db.tasks.update(taskId, { plannedDayId: plannedDay.id, timeBlockId: blockId })
      if (suggestionBlockId === blockId) setSuggestionBlockId(null)
    } catch (err) {
      console.error(err)
      setErrorMsg("Impossible d'affecter cette tâche pour le moment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const unassignTask = async (taskId) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await db.tasks.update(taskId, { plannedDayId: UNASSIGNED_PLANNED_DAY_ID, timeBlockId: null })
    } catch (err) {
      console.error(err)
      setErrorMsg('Impossible de retirer cette tâche pour le moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = !onboardingDone || plannedDay === undefined || (plannedDay && dayTemplate === undefined)

  return (
    <div className="today-view">
      <p className="today-view__date">{formatTodayLabel(parseISODate(todayISO))}</p>

      {isLoading && <p className="today-view__loading">Chargement de votre journée…</p>}

      {!isLoading && !plannedDay && (
        <div className="today-view__empty">
          <p>Aucune journée n'est planifiée pour aujourd'hui. Prenez un instant pour organiser la vôtre.</p>
          <a className="today-view__plan-link" href="#/planification">
            Aller à la Planification
          </a>
        </div>
      )}

      {!isLoading && plannedDay && dayTemplate === null && (
        <div className="today-view__empty">
          <p>Le modèle de journée associé n'existe plus. Choisissez-en un nouveau pour aujourd'hui.</p>
          <a className="today-view__plan-link" href="#/planification">
            Aller à la Planification
          </a>
        </div>
      )}

      {!isLoading && plannedDay && dayTemplate && (
        <section className="today-view__section">
          <h2 className="today-view__heading">{dayTemplate.name}</h2>

          {errorMsg && (
            <div className="today-view__error" role="alert">
              {errorMsg}
            </div>
          )}

          <ul className="today-view__blocks">
            {sortedTimeBlocks.map((block) => {
              const category = categoriesById[block.categoryId]
              const assignedTasks = tasksForDay.filter((task) => task.timeBlockId === block.id)
              const isDropTarget = hoveredBlockId === block.id
              const isSuggestionOpen = suggestionBlockId === block.id
              let suggestions = []
              if (isSuggestionOpen) {
                try {
                  suggestions = suggestTasksForBlock(safeInboxTasks, block)
                } catch (e) {
                  console.error('Suggestion engine error:', e)
                }
              }

              return (
                <li
                  key={block.id}
                  className={`today-view__block${isDropTarget ? ' today-view__block--drag-over' : ''}`}
                  data-time-block={block.id}
                >
                  <div className="today-view__block-header">
                    <span className="today-view__block-time">
                      {block.startTime} – {block.endTime}
                    </span>
                    {category && <span className="today-view__block-category">{category.name}</span>}
                  </div>

                  {assignedTasks.length > 0 ? (
                    <ul className="today-view__tasks">
                      {assignedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          categoriesMap={categoriesById}
                          draggable={assignOptions.length > 0}
                          onDrop={assignTask}
                          onDragOver={setHoveredBlockId}
                          onUnassign={unassignTask}
                          disabled={isSubmitting}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="today-view__no-task">Aucune tâche affectée.</p>
                  )}

                  <button
                    type="button"
                    className="today-view__ghost-button"
                    aria-expanded={isSuggestionOpen}
                    aria-controls={`suggestions-${block.id}`}
                    onClick={() =>
                      setSuggestionBlockId((currentId) => (currentId === block.id ? null : block.id))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' && isSuggestionOpen) {
                        setSuggestionBlockId(null)
                      }
                    }}
                  >
                    {isSuggestionOpen ? 'Fermer les suggestions' : 'Que pourrais-je faire ?'}
                  </button>

                  {isSuggestionOpen && (
                    <div className="today-view__suggestions" id={`suggestions-${block.id}`}>
                      {suggestions.length === 0 ? (
                        <p className="today-view__no-task">
                          Aucune tâche spécifique pour l'instant, quartier libre !
                        </p>
                      ) : (
                        <ul className="today-view__tasks">
                          {suggestions.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              categoriesMap={categoriesById}
                              assignOptions={assignOptions}
                              onAssign={assignTask}
                              disabled={isSubmitting}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          {orphanedTasks.length > 0 && (
            <div className="today-view__orphaned">
              <p className="today-view__orphaned-heading">
                Tâches non classées (leur plage horaire n'existe plus)
              </p>
              <ul className="today-view__tasks">
                {orphanedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    categoriesMap={categoriesById}
                    draggable={assignOptions.length > 0}
                    onDrop={assignTask}
                    onDragOver={setHoveredBlockId}
                    onUnassign={unassignTask}
                    disabled={isSubmitting}
                  />
                ))}
              </ul>
            </div>
          )}

          <div className="today-view__depot">
            <p className="today-view__depot-heading">Dépôt</p>
            {sortedInboxTasks.length === 0 ? (
              <p className="today-view__no-task">Aucune tâche à affecter pour le moment.</p>
            ) : (
              <ul className="today-view__depot-list">
                {sortedInboxTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    categoriesMap={categoriesById}
                    draggable={assignOptions.length > 0}
                    onDrop={assignTask}
                    onDragOver={setHoveredBlockId}
                    assignOptions={assignOptions}
                    onAssign={assignTask}
                    disabled={isSubmitting}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
