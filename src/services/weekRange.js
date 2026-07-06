// Calculs de la semaine courante (Lundi → Dimanche) au format ISO `YYYY-MM-DD`.
// AD-6 : aucune dépendance tierce (moment/date-fns). Le format ISO est obtenu via
// l'API native `Intl.DateTimeFormat('en-CA')`, qui rend bien `YYYY-MM-DD` dans le
// fuseau local — évitant le décalage d'un jour que provoquerait `toISOString()` (UTC).

const ISO_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function toISODate(date) {
  return ISO_DATE_FORMATTER.format(date)
}

export function parseISODate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(isoDate, amount) {
  const date = parseISODate(isoDate)
  date.setDate(date.getDate() + amount)
  return toISODate(date)
}

// getDay() : 0 = dimanche … 6 = samedi. On rattache le dimanche à la semaine qui
// s'achève (lundi précédent) plutôt qu'à celle qui commence.
export function getWeekDates(todayISO) {
  const dayOfWeek = parseISODate(todayISO).getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const mondayISO = addDays(todayISO, diffToMonday)
  return Array.from({ length: 7 }, (_, index) => addDays(mondayISO, index))
}

export function getWeekRange(todayISO) {
  const dates = getWeekDates(todayISO)
  return { mondayISO: dates[0], sundayISO: dates[6], dates }
}
