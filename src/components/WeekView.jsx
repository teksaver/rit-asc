import { useLiveQuery } from 'dexie-react-hooks'
import { db, UNASSIGNED_PLANNED_DAY_ID } from '../db'
import { getWeekRange, parseISODate } from '../services/weekRange'
import './WeekView.css'

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' })
const DAY_MONTH_FORMATTER = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' })
const ISO_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function todayISO() {
  return ISO_DATE_FORMATTER.format(new Date())
}

function formatDayLabel(isoDate) {
  const date = parseISODate(isoDate)
  const weekday = WEEKDAY_FORMATTER.format(date)
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  return `${capitalizedWeekday} ${DAY_MONTH_FORMATTER.format(date)}`
}

function sortByStartTime(a, b) {
  return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0
}

export function WeekView() {
  const { mondayISO, sundayISO, dates } = getWeekRange(todayISO())

  // Vue en lecture seule : on lit la semaine déjà stockée dans Dexie (AD-1).
  // La borne est inclusive des deux côtés (lundi → dimanche compris).
  const plannedDays = useLiveQuery(
    () => db.plannedDays.where('date').between(mondayISO, sundayISO, true, true).toArray(),
    [mondayISO, sundayISO],
  )
  const dayTemplates = useLiveQuery(() => db.dayTemplates.toArray(), [], [])
  const timeBlocks = useLiveQuery(() => db.timeBlocks.toArray(), [], [])
  const categories = useLiveQuery(() => db.categories.toArray(), [], [])
  // Chargement complet puis filtrage en mémoire (comme TodayView) : évite une
  // requête chaînée dépendante d'une autre useLiveQuery et son timing fragile.
  const plannedTasks = useLiveQuery(
    () => db.tasks.where('plannedDayId').notEqual(UNASSIGNED_PLANNED_DAY_ID).toArray(),
    [],
    [],
  )

  const isLoading = plannedDays === undefined

  const dayTemplatesById = dayTemplates.reduce((acc, template) => {
    acc[template.id] = template
    return acc
  }, {})
  const categoriesById = categories.reduce((acc, category) => {
    acc[category.id] = category
    return acc
  }, {})
  const plannedDaysByDate = (plannedDays ?? []).reduce((acc, plannedDay) => {
    acc[plannedDay.date] = plannedDay
    return acc
  }, {})

  const hasAnyPlannedDay = (plannedDays ?? []).length > 0

  return (
    <div className="week-view">
      <div className="week-view__header">
        <h2 className="week-view__heading">
          Semaine du {DAY_MONTH_FORMATTER.format(parseISODate(mondayISO))} au{' '}
          {DAY_MONTH_FORMATTER.format(parseISODate(sundayISO))}
        </h2>
        <button type="button" className="week-view__export" onClick={() => window.print()}>
          Exporter
        </button>
      </div>

      {isLoading && <p className="week-view__loading">Chargement de votre semaine…</p>}

      {!isLoading && !hasAnyPlannedDay && (
        <p className="week-view__empty">
          Aucune journée n'est planifiée cette semaine. Rendez-vous dans la Planification pour
          organiser vos journées.
        </p>
      )}

      {!isLoading && (
        <ol className="week-view__days">
          {dates.map((date) => {
            const plannedDay = plannedDaysByDate[date]
            const template = plannedDay ? dayTemplatesById[plannedDay.dayTemplateId] : null
            const dayBlocks = plannedDay
              ? [...timeBlocks]
                  .filter((block) => block.dayTemplateId === plannedDay.dayTemplateId)
                  .sort(sortByStartTime)
              : []

            return (
              <li key={date} className="week-view__day">
                <h3 className="week-view__day-label">{formatDayLabel(date)}</h3>

                {!plannedDay && <p className="week-view__day-empty">Aucune journée planifiée</p>}

                {plannedDay && (
                  <div className="week-view__day-body">
                    <p className="week-view__day-template">
                      {template ? template.name : 'Modèle supprimé'}
                    </p>
                    {dayBlocks.length === 0 ? (
                      <p className="week-view__day-empty">Aucune plage horaire</p>
                    ) : (
                      <ul className="week-view__blocks">
                        {dayBlocks.map((block) => {
                          const category = categoriesById[block.categoryId]
                          const blockTasks = plannedTasks.filter(
                            (task) =>
                              task.plannedDayId === plannedDay.id && task.timeBlockId === block.id,
                          )
                          return (
                            <li key={block.id} className="week-view__block">
                              <div className="week-view__block-header">
                                <span className="week-view__block-time">
                                  {block.startTime} – {block.endTime}
                                </span>
                                {category && (
                                  <span className="week-view__block-category">{category.name}</span>
                                )}
                              </div>
                              {blockTasks.length > 0 && (
                                <ul className="week-view__block-tasks">
                                  {blockTasks.map((task) => (
                                    <li key={task.id} className="week-view__block-task">
                                      {task.title}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
