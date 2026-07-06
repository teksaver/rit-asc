import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { WeekView } from './WeekView'
import { db } from '../db'

// Semaine de référence : mercredi 2026-07-08 → semaine du lundi 2026-07-06 au
// dimanche 2026-07-12.
async function seedPlannedDay({ date, templateName, block, taskTitle, categoryName }) {
  const dayTemplateId = crypto.randomUUID()
  await db.dayTemplates.add({ id: dayTemplateId, name: templateName })
  let categoryId
  if (categoryName) {
    categoryId = crypto.randomUUID()
    await db.categories.add({ id: categoryId, name: categoryName, color: '#BFDBFE' })
  }
  let timeBlockId
  if (block) {
    timeBlockId = crypto.randomUUID()
    await db.timeBlocks.add({
      id: timeBlockId,
      dayTemplateId,
      categoryId,
      startTime: block.startTime,
      endTime: block.endTime,
    })
  }
  const plannedDayId = crypto.randomUUID()
  await db.plannedDays.add({ id: plannedDayId, date, dayTemplateId })
  if (taskTitle) {
    await db.tasks.add({
      id: crypto.randomUUID(),
      title: taskTitle,
      status: 'planned',
      createdAt: new Date().toISOString(),
      plannedDayId,
      timeBlockId,
    })
  }
  return { dayTemplateId, plannedDayId, timeBlockId, categoryId }
}

describe('WeekView', () => {
  beforeEach(async () => {
    vi.setSystemTime(new Date('2026-07-08T10:00:00'))
    await db.tasks.clear()
    await db.categories.clear()
    await db.dayTemplates.clear()
    await db.timeBlocks.clear()
    await db.plannedDays.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('affiche les 7 jours du lundi au dimanche de la semaine courante', async () => {
    render(<WeekView />)

    expect(await screen.findByText('Lundi 06/07')).toBeInTheDocument()
    expect(screen.getByText('Mercredi 08/07')).toBeInTheDocument()
    expect(screen.getByText('Dimanche 12/07')).toBeInTheDocument()
  })

  it('gère élégamment une semaine sans aucune journée planifiée', async () => {
    render(<WeekView />)

    expect(await screen.findByText(/aucune journée.*planifiée cette semaine/i)).toBeInTheDocument()
  })

  it('affiche la synthèse d’une journée planifiée (modèle, plage, catégorie, tâche)', async () => {
    await seedPlannedDay({
      date: '2026-07-08',
      templateName: 'Télétravail',
      block: { startTime: '10:00', endTime: '11:00' },
      categoryName: 'Deep Work',
      taskTitle: 'Rédiger le rapport',
    })

    render(<WeekView />)

    // La tâche provient d'une useLiveQuery distincte qui résout après le modèle :
    // on l'attend explicitement pour éviter toute course.
    expect(await screen.findByText('Rédiger le rapport')).toBeInTheDocument()
    expect(screen.getByText('Télétravail')).toBeInTheDocument()
    expect(screen.getByText(/10:00.*11:00/)).toBeInTheDocument()
    expect(screen.getByText('Deep Work')).toBeInTheDocument()
  })

  it('n’inclut que les journées de la semaine courante (borne Dexie between)', async () => {
    await seedPlannedDay({ date: '2026-07-08', templateName: 'DansLaSemaine' })
    await seedPlannedDay({ date: '2026-07-20', templateName: 'SemaineSuivante' })

    render(<WeekView />)

    expect(await screen.findByText('DansLaSemaine')).toBeInTheDocument()
    expect(screen.queryByText('SemaineSuivante')).not.toBeInTheDocument()
  })

  it('déclenche l’impression système au clic sur « Exporter »', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<WeekView />)

    const exportButton = await screen.findByRole('button', { name: /exporter/i })
    fireEvent.click(exportButton)

    expect(printSpy).toHaveBeenCalledTimes(1)
  })

  it('rattache chaque tâche à sa journée dans la grille', async () => {
    await seedPlannedDay({
      date: '2026-07-06',
      templateName: 'Lundi type',
      block: { startTime: '09:00', endTime: '10:00' },
      taskTitle: 'Tâche du lundi',
    })

    render(<WeekView />)

    // Attendre le rendu asynchrone de la tâche avant de vérifier son rattachement.
    const taskEl = await screen.findByText('Tâche du lundi')
    const mondayCell = taskEl.closest('li.week-view__day')
    expect(within(mondayCell).getByText('Lundi 06/07')).toBeInTheDocument()
  })
})
