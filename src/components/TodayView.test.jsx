import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { TodayView } from './TodayView'
import { db } from '../db'

beforeAll(() => {
  window.HTMLElement.prototype.setPointerCapture = () => {}
  window.HTMLElement.prototype.releasePointerCapture = () => {}
  window.HTMLElement.prototype.hasPointerCapture = () => true
  // jsdom doesn't implement elementFromPoint at all (throws "not a function"); the
  // drag & drop hit-testing needs a stub, overridden per test for drop scenarios.
  document.elementFromPoint = () => null
})

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
    document.elementFromPoint = () => null
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

  it('shows the Dépôt with unassigned inbox tasks, without any blocking dialog', async () => {
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
    await db.tasks.add({
      id: crypto.randomUUID(),
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

    expect(await screen.findByText('Dépôt')).toBeInTheDocument()
    expect(screen.getByText('Préparer le rapport')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('lets the user assign an inbox task to a time block via the accessible selector', async () => {
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

    const taskRow = (await screen.findByText('Préparer le rapport')).closest('.task-card')
    fireEvent.change(within(taskRow).getByLabelText('Affecter à'), { target: { value: blockId } })

    await waitFor(async () => {
      const task = await db.tasks.get(taskId)
      expect(task).toMatchObject({ plannedDayId, timeBlockId: blockId })
    })

    const blockRow = (await screen.findByText(/10:00.*11:00/, { selector: '.today-view__block-time' })).closest('[data-time-block]')
    expect(await within(blockRow).findByText('Préparer le rapport')).toBeInTheDocument()
  })

  it('lets the user assign an inbox task to a time block via drag & drop', async () => {
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
      plannedDayId: '',
      timeBlockId: null,
      checklist: [],
    })

    render(<TodayView />)

    const blockRow = (await screen.findByText(/10:00.*11:00/, { selector: '.today-view__block-time' })).closest('[data-time-block]')
    document.elementFromPoint = () => blockRow

    const taskCard = (await screen.findByText('Préparer le rapport')).closest('.task-card')
    fireEvent.pointerDown(taskCard, { clientX: 0, clientY: 0, pointerId: 1, isPrimary: true })
    fireEvent.pointerMove(taskCard, { clientX: 5, clientY: 120, pointerId: 1, isPrimary: true })
    expect(blockRow.className).toContain('today-view__block--drag-over')

    fireEvent.pointerUp(taskCard, { clientX: 5, clientY: 120, pointerId: 1, isPrimary: true })

    await waitFor(async () => {
      const task = await db.tasks.get(taskId)
      expect(task).toMatchObject({ plannedDayId, timeBlockId: blockId })
    })
    expect(blockRow.className).not.toContain('today-view__block--drag-over')
    expect(await within(blockRow).findByText('Préparer le rapport')).toBeInTheDocument()
  })

  it('lets the user drag a task already assigned to one time block into another', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    const blockAId = crypto.randomUUID()
    const blockBId = crypto.randomUUID()
    await db.timeBlocks.add({
      id: blockAId,
      dayTemplateId,
      categoryId: null,
      startTime: '09:00',
      endTime: '10:00',
    })
    await db.timeBlocks.add({
      id: blockBId,
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
      timeBlockId: blockAId,
      checklist: [],
    })

    render(<TodayView />)

    const blockBRow = (await screen.findByText(/10:00.*11:00/, { selector: '.today-view__block-time' })).closest('[data-time-block]')
    document.elementFromPoint = () => blockBRow

    const taskCard = (await screen.findByText('Préparer le rapport')).closest('.task-card')
    fireEvent.pointerDown(taskCard, { clientX: 0, clientY: 0, pointerId: 1, isPrimary: true })
    fireEvent.pointerMove(taskCard, { clientX: 5, clientY: 40, pointerId: 1, isPrimary: true })
    fireEvent.pointerUp(taskCard, { clientX: 5, clientY: 40, pointerId: 1, isPrimary: true })

    await waitFor(async () => {
      const task = await db.tasks.get(taskId)
      expect(task).toMatchObject({ plannedDayId, timeBlockId: blockBId })
    })
    expect(await within(blockBRow).findByText('Préparer le rapport')).toBeInTheDocument()
  })

  it('leaves the task in the Dépôt when the drop lands outside any time block', async () => {
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
      plannedDayId: '',
      timeBlockId: null,
      checklist: [],
    })

    render(<TodayView />)

    document.elementFromPoint = () => null

    const taskCard = (await screen.findByText('Préparer le rapport')).closest('.task-card')
    fireEvent.pointerDown(taskCard, { clientX: 0, clientY: 0, pointerId: 1, isPrimary: true })
    fireEvent.pointerMove(taskCard, { clientX: 5, clientY: 120, pointerId: 1, isPrimary: true })
    fireEvent.pointerUp(taskCard, { clientX: 5, clientY: 120, pointerId: 1, isPrimary: true })

    const task = await db.tasks.get(taskId)
    expect(task).toMatchObject({ plannedDayId: '', timeBlockId: null })
    expect(screen.getByText('Préparer le rapport')).toBeInTheDocument()
  })

  it('lets the user unassign a task back to the Inbox via the Retirer button', async () => {
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

    const blockRow = (await screen.findByText(/10:00.*11:00/, { selector: '.today-view__block-time' })).closest('[data-time-block]')
    const taskRow = within(blockRow).getByText('Préparer le rapport').closest('.task-card')
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

  it('lets the user unassign a task back to the Inbox via a leftward swipe', async () => {
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

    const blockRow = (await screen.findByText(/10:00.*11:00/, { selector: '.today-view__block-time' })).closest('[data-time-block]')
    const taskCard = within(blockRow).getByText('Préparer le rapport').closest('.task-card')
    fireEvent.pointerDown(taskCard, { clientX: 90, clientY: 0, pointerId: 1, isPrimary: true })
    fireEvent.pointerUp(taskCard, { clientX: 0, clientY: 0, pointerId: 1, isPrimary: true })

    await waitFor(async () => {
      const task = await db.tasks.get(taskId)
      expect(task).toMatchObject({ plannedDayId: '', timeBlockId: null })
    })
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
