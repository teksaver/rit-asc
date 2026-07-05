import { useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import './PlanningView.css'

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' })
const DAY_MONTH_FORMATTER = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' })

function parseISODate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(dateStr, amount) {
  const date = parseISODate(dateStr)
  date.setDate(date.getDate() + amount)
  return toISODate(date)
}

function getCurrentWeekDates(todayISO) {
  const dayOfWeek = parseISODate(todayISO).getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const mondayISO = addDays(todayISO, diffToMonday)
  return Array.from({ length: 7 }, (_, index) => addDays(mondayISO, index))
}

function formatDateLabel(dateStr) {
  const date = parseISODate(dateStr)
  const weekday = WEEKDAY_FORMATTER.format(date)
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  return `${capitalizedWeekday} ${DAY_MONTH_FORMATTER.format(date)}`
}

export function PlanningView() {
  const todayISO = toISODate(new Date())
  const weekDates = useMemo(() => getCurrentWeekDates(todayISO), [todayISO])
  const nextWeekDates = useMemo(() => weekDates.map((date) => addDays(date, 7)), [weekDates])
  const relevantDates = useMemo(() => [...weekDates, ...nextWeekDates], [weekDates, nextWeekDates])
  const dialogRef = useRef(null)

  const [selections, setSelections] = useState({})
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const isBusy = isSubmitting || pendingAction !== null

  const dayTemplates = useLiveQuery(() => db.dayTemplates.toArray(), [], [])
  const plannedDays = useLiveQuery(
    () => db.plannedDays.where('date').anyOf(relevantDates).toArray(),
    [relevantDates],
    [],
  )

  const dayTemplatesById = dayTemplates.reduce((acc, template) => {
    acc[template.id] = template
    return acc
  }, {})

  const plannedDaysByDate = plannedDays.reduce((acc, plannedDay) => {
    acc[plannedDay.date] = plannedDay
    return acc
  }, {})

  const openConfirmDialog = (action) => {
    setPendingAction(action)
    dialogRef.current?.showModal()
  }

  const closeConfirmDialog = () => {
    setPendingAction(null)
    dialogRef.current?.close()
  }

  const upsertPlannedDay = async (date, dayTemplateId, existingId) => {
    await db.plannedDays.put({ id: existingId ?? crypto.randomUUID(), date, dayTemplateId })
  }

  const assignTemplate = async (date) => {
    if (isBusy) return
    const dayTemplateId = selections[date]
    if (!dayTemplateId) {
      setErrorMsg('Choisissez une journée type avant de l’assigner.')
      return
    }

    const existing = plannedDaysByDate[date]
    if (existing) {
      openConfirmDialog({ kind: 'assign', date, dayTemplateId, existingId: existing.id })
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await upsertPlannedDay(date, dayTemplateId)
    } catch (err) {
      console.error(err)
      setErrorMsg("Impossible d'assigner cette journée type.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const duplicateWeek = async () => {
    if (isBusy) return

    const hasCurrentAssignment = weekDates.some((date) => plannedDaysByDate[date])
    if (!hasCurrentAssignment) {
      setErrorMsg('Aucune journée planifiée cette semaine à dupliquer.')
      return
    }

    const nextWeekHasExisting = weekDates.some((date) => plannedDaysByDate[addDays(date, 7)])
    if (nextWeekHasExisting) {
      openConfirmDialog({ kind: 'duplicate' })
      return
    }

    await performDuplicate()
  }

  const performDuplicate = async () => {
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await db.transaction('rw', db.plannedDays, async () => {
        for (const date of weekDates) {
          const nextDate = addDays(date, 7)
          const current = plannedDaysByDate[date]
          const existingNext = plannedDaysByDate[nextDate]
          if (current) {
            await upsertPlannedDay(nextDate, current.dayTemplateId, existingNext?.id)
          } else if (existingNext) {
            await db.plannedDays.delete(existingNext.id)
          }
        }
      })
    } catch (err) {
      console.error(err)
      setErrorMsg('Impossible de dupliquer la semaine.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmPendingAction = async () => {
    if (!pendingAction) return
    if (pendingAction.kind === 'assign') {
      setIsSubmitting(true)
      setErrorMsg('')
      try {
        await upsertPlannedDay(pendingAction.date, pendingAction.dayTemplateId, pendingAction.existingId)
      } catch (err) {
        console.error(err)
        setErrorMsg("Impossible d'assigner cette journée type.")
      } finally {
        setIsSubmitting(false)
      }
    } else if (pendingAction.kind === 'duplicate') {
      await performDuplicate()
    }
    closeConfirmDialog()
  }

  return (
    <div className="planning-view">
      <section className="planning-view__section">
        <div className="planning-view__section-header">
          <h2 className="planning-view__heading">Semaine en cours</h2>
          <button
            type="button"
            className="planning-view__duplicate"
            onClick={duplicateWeek}
            disabled={isBusy}
          >
            Dupliquer sur la semaine suivante
          </button>
        </div>

        {errorMsg && (
          <div className="planning-view__error" role="alert">
            {errorMsg}
          </div>
        )}

        <ul className="planning-view__days">
          {weekDates.map((date) => {
            const plannedDay = plannedDaysByDate[date]
            const assignedTemplate = plannedDay ? dayTemplatesById[plannedDay.dayTemplateId] : null

            return (
              <li key={date} className="planning-view__day" data-planning-row>
                <div className="planning-view__day-label">{formatDateLabel(date)}</div>
                {assignedTemplate && (
                  <div className="planning-view__day-assigned">Actuellement : {assignedTemplate.name}</div>
                )}
                <div className="planning-view__day-form">
                  <label className="planning-view__field">
                    Journée type
                    <select
                      value={selections[date] ?? ''}
                      disabled={isBusy}
                      onChange={(event) =>
                        setSelections((current) => ({ ...current, [date]: event.target.value }))
                      }
                    >
                      <option value="">Choisir…</option>
                      {dayTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="planning-view__assign"
                    onClick={() => assignTemplate(date)}
                    disabled={isBusy}
                  >
                    Assigner
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <dialog
        ref={dialogRef}
        className="planning-view__dialog"
        onCancel={closeConfirmDialog}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeConfirmDialog()
        }}
      >
        <p>
          {pendingAction?.kind === 'duplicate'
            ? 'Des journées sont déjà planifiées la semaine prochaine. Voulez-vous les écraser ?'
            : 'Une journée est déjà planifiée à cette date. Voulez-vous l’écraser ?'}
        </p>
        <div className="planning-view__dialog-actions">
          <button type="button" onClick={closeConfirmDialog}>
            Annuler
          </button>
          <button type="button" className="planning-view__dialog-confirm" onClick={confirmPendingAction}>
            Confirmer
          </button>
        </div>
      </dialog>
    </div>
  )
}
