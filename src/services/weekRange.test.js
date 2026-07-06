import { describe, it, expect } from 'vitest'
import { getWeekDates, getWeekRange, addDays, toISODate, parseISODate } from './weekRange'

describe('weekRange', () => {
  it('renvoie les 7 dates ISO du lundi au dimanche pour un jour de milieu de semaine', () => {
    // 2026-07-08 est un mercredi
    const dates = getWeekDates('2026-07-08')
    expect(dates).toEqual([
      '2026-07-06', // lundi
      '2026-07-07',
      '2026-07-08',
      '2026-07-09',
      '2026-07-10',
      '2026-07-11',
      '2026-07-12', // dimanche
    ])
  })

  it('rattache le dimanche à la semaine qui vient de se terminer (semaine du lundi précédent)', () => {
    // 2026-07-12 est un dimanche → sa semaine commence le lundi 2026-07-06
    const dates = getWeekDates('2026-07-12')
    expect(dates[0]).toBe('2026-07-06')
    expect(dates[6]).toBe('2026-07-12')
  })

  it('garde un lundi comme premier jour de sa propre semaine', () => {
    const dates = getWeekDates('2026-07-06')
    expect(dates[0]).toBe('2026-07-06')
    expect(dates[6]).toBe('2026-07-12')
  })

  it('expose les bornes lundi/dimanche via getWeekRange', () => {
    const { mondayISO, sundayISO, dates } = getWeekRange('2026-07-08')
    expect(mondayISO).toBe('2026-07-06')
    expect(sundayISO).toBe('2026-07-12')
    expect(dates).toHaveLength(7)
  })

  it('traverse correctement les changements de mois', () => {
    // 2026-08-01 est un samedi → semaine du lundi 2026-07-27 au dimanche 2026-08-02
    const dates = getWeekDates('2026-08-01')
    expect(dates[0]).toBe('2026-07-27')
    expect(dates[6]).toBe('2026-08-02')
  })

  it('addDays additionne des jours en franchissant une année', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('toISODate/parseISODate font un aller-retour stable dans le fuseau local', () => {
    const iso = '2026-02-15'
    expect(toISODate(parseISODate(iso))).toBe(iso)
  })
})
