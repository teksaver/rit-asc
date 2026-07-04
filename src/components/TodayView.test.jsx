import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { TodayView } from './TodayView'
import { db } from '../db'

describe('TodayView', () => {
  beforeEach(async () => {
    vi.setSystemTime(new Date('2026-07-06T10:00:00'))
    await db.tasks.clear()
    await db.categories.clear()
    await db.dayTemplates.clear()
    await db.timeBlocks.clear()
    await db.plannedDays.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('silently onboards on an empty database and shows the standard day', async () => {
    render(<TodayView />)

    expect(await screen.findByText('Journée Standard')).toBeInTheDocument()
    expect(screen.getByText(/09:00.*12:00/)).toBeInTheDocument()

    const dayTemplates = await db.dayTemplates.toArray()
    expect(dayTemplates).toHaveLength(1)
  })

  it('shows the time blocks of an existing PlannedDay', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    const categoryId = crypto.randomUUID()
    await db.categories.add({ id: categoryId, name: 'Deep Work', color: '#BFDBFE' })
    await db.timeBlocks.add({
      id: crypto.randomUUID(),
      dayTemplateId,
      categoryId,
      startTime: '10:00',
      endTime: '11:00',
    })
    await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId })

    render(<TodayView />)

    expect(await screen.findByText('Télétravail')).toBeInTheDocument()
    expect(screen.getByText(/10:00.*11:00/)).toBeInTheDocument()
    expect(screen.getByText('Deep Work')).toBeInTheDocument()
  })

  it('invites to plan when no PlannedDay exists for today and it is not the first run', async () => {
    await db.categories.add({ id: crypto.randomUUID(), name: 'Travail', color: '#BFDBFE' })
    await db.dayTemplates.add({ id: crypto.randomUUID(), name: 'Télétravail' })

    render(<TodayView />)

    expect(await screen.findByText(/aucune journée.*planifiée/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /planification/i })).toHaveAttribute(
      'href',
      '#/planification',
    )

    const dayTemplates = await db.dayTemplates.toArray()
    expect(dayTemplates).toHaveLength(1)
  })

  it('lets the user manually assign an inbox task to a time block', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    const categoryId = crypto.randomUUID()
    await db.categories.add({ id: categoryId, name: 'Deep Work', color: '#BFDBFE' })
    const blockId = crypto.randomUUID()
    await db.timeBlocks.add({
      id: blockId,
      dayTemplateId,
      categoryId,
      startTime: '10:00',
      endTime: '11:00',
    })
    const plannedDayId = crypto.randomUUID()
    await db.plannedDays.add({ id: plannedDayId, date: '2026-07-06', dayTemplateId })

    const taskId = crypto.randomUUID()
    await db.tasks.add({
      id: taskId,
      title: 'Préparer le rapport',
      status: 'inbox',
      createdAt: new Date().toISOString(),
      category: null,
      priority: null,
      categoryId: null,
      plannedDayId: '',
      timeBlockId: null,
      checklist: [],
    })

    render(<TodayView />)

    const blockRow = (await screen.findByText(/10:00.*11:00/)).closest('[data-time-block]')
    fireEvent.click(within(blockRow).getByRole('button', { name: 'Affecter une tâche' }))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Préparer le rapport' }))

    await waitFor(async () => {
      const task = await db.tasks.get(taskId)
      expect(task).toMatchObject({ plannedDayId, timeBlockId: blockId })
    })

    expect(await within(blockRow).findByText('Préparer le rapport')).toBeInTheDocument()
  })

  it('restores focus to the triggering button when the assign dialog is cancelled', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    const blockId = crypto.randomUUID()
    await db.timeBlocks.add({
      id: blockId,
      dayTemplateId,
      categoryId: null,
      startTime: '10:00',
      endTime: '11:00',
    })
    await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId })

    render(<TodayView />)

    const blockRow = (await screen.findByText(/10:00.*11:00/)).closest('[data-time-block]')
    const assignButton = within(blockRow).getByRole('button', { name: 'Affecter une tâche' })
    fireEvent.click(assignButton)

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Annuler' }))

    expect(document.activeElement).toBe(assignButton)
  })

  it('lets the user unassign a task back to the Inbox', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    const blockId = crypto.randomUUID()
    await db.timeBlocks.add({
      id: blockId,
      dayTemplateId,
      categoryId: null,
      startTime: '10:00',
      endTime: '11:00',
    })
    const plannedDayId = crypto.randomUUID()
    await db.plannedDays.add({ id: plannedDayId, date: '2026-07-06', dayTemplateId })

    const taskId = crypto.randomUUID()
    await db.tasks.add({
      id: taskId,
      title: 'Préparer le rapport',
      status: 'inbox',
      createdAt: new Date().toISOString(),
      category: null,
      priority: null,
      categoryId: null,
      plannedDayId,
      timeBlockId: blockId,
      checklist: [],
    })

    render(<TodayView />)

    const blockRow = (await screen.findByText(/10:00.*11:00/)).closest('[data-time-block]')
    const taskRow = within(blockRow).getByText('Préparer le rapport').closest('li')
    fireEvent.click(within(taskRow).getByRole('button', { name: 'Retirer' }))

    await waitFor(async () => {
      const task = await db.tasks.get(taskId)
      expect(task).toMatchObject({ plannedDayId: '', timeBlockId: null })
    })

    await waitFor(() => {
      expect(within(blockRow).queryByText('Préparer le rapport')).not.toBeInTheDocument()
    })
    expect(within(blockRow).getByText('Aucune tâche affectée.')).toBeInTheDocument()
  })

  it('shows orphaned tasks whose time block no longer exists, instead of hiding them', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    const plannedDayId = crypto.randomUUID()
    await db.plannedDays.add({ id: plannedDayId, date: '2026-07-06', dayTemplateId })

    const taskId = crypto.randomUUID()
    await db.tasks.add({
      id: taskId,
      title: 'Tâche orpheline',
      status: 'inbox',
      createdAt: new Date().toISOString(),
      category: null,
      priority: null,
      categoryId: null,
      plannedDayId,
      timeBlockId: crypto.randomUUID(),
      checklist: [],
    })

    render(<TodayView />)

    expect(await screen.findByText('Tâche orpheline')).toBeInTheDocument()
    expect(screen.getByText(/leur plage horaire n'existe plus/i)).toBeInTheDocument()
  })
})
