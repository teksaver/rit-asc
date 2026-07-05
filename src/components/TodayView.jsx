import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, UNASSIGNED_PLANNED_DAY_ID } from '../db'
import { ensureOnboarding } from '../services/onboarding'
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
  const dialogRef = useRef(null)
  const triggerRef = useRef(null)
  const [assigningBlockId, setAssigningBlockId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [onboardingDone, setOnboardingDone] = useState(false)

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

  const categoriesById = categories.reduce((acc, category) => {
    acc[category.id] = category
    return acc
  }, {})

  const sortedTimeBlocks = [...timeBlocks].sort((a, b) =>
    a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0,
  )
  const timeBlockIds = new Set(sortedTimeBlocks.map((block) => block.id))
  const orphanedTasks = tasksForDay.filter((task) => !timeBlockIds.has(task.timeBlockId))
  const sortedInboxTasks = [...inboxTasks].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
  )

  const openAssignDialog = (blockId, event) => {
    setErrorMsg('')
    setAssigningBlockId(blockId)
    triggerRef.current = event?.currentTarget ?? null
    dialogRef.current?.showModal()
  }

  const closeAssignDialog = () => {
    setAssigningBlockId(null)
    dialogRef.current?.close()
    triggerRef.current?.focus()
    triggerRef.current = null
  }

  const requestCloseAssignDialog = () => {
    if (isSubmitting) return
    closeAssignDialog()
  }

  const assignTask = async (taskId) => {
    if (isSubmitting || !plannedDay || !assigningBlockId) return
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await db.tasks.update(taskId, { plannedDayId: plannedDay.id, timeBlockId: assigningBlockId })
      closeAssignDialog()
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

          {errorMsg && !assigningBlockId && (
            <div className="today-view__error" role="alert">
              {errorMsg}
            </div>
          )}

          <ul className="today-view__blocks">
            {sortedTimeBlocks.map((block) => {
              const category = categoriesById[block.categoryId]
              const assignedTasks = tasksForDay.filter((task) => task.timeBlockId === block.id)

              return (
                <li key={block.id} className="today-view__block" data-time-block>
                  <div className="today-view__block-header">
                    <span className="today-view__block-time">
                      {block.startTime} – {block.endTime}
                    </span>
                    {category && <span className="today-view__block-category">{category.name}</span>}
                  </div>

                  {assignedTasks.length > 0 ? (
                    <ul className="today-view__tasks">
                      {assignedTasks.map((task) => (
                        <li key={task.id} className="today-view__task">
                          <span>{task.title}</span>
                          <button
                            type="button"
                            className="today-view__unassign-button"
                            disabled={isSubmitting}
                            onClick={() => unassignTask(task.id)}
                          >
                            Retirer
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="today-view__no-task">Aucune tâche affectée.</p>
                  )}

                  <button
                    type="button"
                    className="today-view__assign-button"
                    onClick={(event) => openAssignDialog(block.id, event)}
                  >
                    Affecter une tâche
                  </button>
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
                  <li key={task.id} className="today-view__task">
                    <span>{task.title}</span>
                    <button
                      type="button"
                      className="today-view__unassign-button"
                      disabled={isSubmitting}
                      onClick={() => unassignTask(task.id)}
                    >
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <dialog
        ref={dialogRef}
        className="today-view__dialog"
        aria-label="Affecter une tâche de l'Inbox"
        onCancel={(event) => {
          if (isSubmitting) {
            event.preventDefault()
            return
          }
          closeAssignDialog()
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) requestCloseAssignDialog()
        }}
      >
        <p>Choisissez une tâche du Dépôt à affecter à cette plage.</p>

        {errorMsg && assigningBlockId && (
          <div className="today-view__error" role="alert">
            {errorMsg}
          </div>
        )}

        {sortedInboxTasks.length === 0 ? (
          <p className="today-view__no-task">Aucune tâche disponible dans le Dépôt.</p>
        ) : (
          <ul className="today-view__dialog-tasks">
            {sortedInboxTasks.map((task) => (
              <li key={task.id}>
                <button type="button" disabled={isSubmitting} onClick={() => assignTask(task.id)}>
                  {task.title}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="today-view__dialog-actions">
          <button type="button" disabled={isSubmitting} onClick={requestCloseAssignDialog}>
            Annuler
          </button>
        </div>
      </dialog>
    </div>
  )
}
