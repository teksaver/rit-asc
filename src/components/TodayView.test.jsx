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

  describe('Bouton Magique (suggestions)', () => {
    it('affiche le bouton "Que pourrais-je faire ?" sur une plage vide', async () => {
      vi.setSystemTime(new Date('2026-07-06T08:00:00'))
      const dayTemplateId = crypto.randomUUID()
      await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
      await db.timeBlocks.add({
        id: crypto.randomUUID(),
        dayTemplateId,
        categoryId: null,
        startTime: '10:00',
        endTime: '11:00',
      })
      await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId })

      render(<TodayView />)

      expect(await screen.findByRole('button', { name: 'Que pourrais-je faire ?' })).toBeInTheDocument()
    })

    it("affiche le bouton même quand la plage est remplie et n'est pas en cours, pour rouvrir les suggestions", async () => {
      vi.setSystemTime(new Date('2026-07-06T08:00:00'))
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
      await db.tasks.add({
        id: crypto.randomUUID(),
        title: 'Déjà planifiée',
        status: 'inbox',
        createdAt: new Date().toISOString(),
        categoryId: null,
        priority: 'could',
        plannedDayId,
        timeBlockId: blockId,
        checklist: [],
      })

      render(<TodayView />)

      expect(await screen.findByText('Déjà planifiée')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Que pourrais-je faire ?' })).toBeInTheDocument()
    })

    it('affiche le bouton quand la plage est en cours, même remplie', async () => {
      vi.setSystemTime(new Date('2026-07-06T10:30:00'))
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
      await db.tasks.add({
        id: crypto.randomUUID(),
        title: 'Déjà planifiée',
        status: 'inbox',
        createdAt: new Date().toISOString(),
        categoryId: null,
        priority: 'could',
        plannedDayId,
        timeBlockId: blockId,
        checklist: [],
      })

      render(<TodayView />)

      expect(await screen.findByRole('button', { name: 'Que pourrais-je faire ?' })).toBeInTheDocument()
    })

    it('suggère les tâches du dépôt filtrées par catégorie et triées par priorité, et permet de les affecter', async () => {
      vi.setSystemTime(new Date('2026-07-06T08:00:00'))
      const dayTemplateId = crypto.randomUUID()
      await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
      const categoryId = crypto.randomUUID()
      const otherCategoryId = crypto.randomUUID()
      await db.categories.add({ id: categoryId, name: 'Deep Work', color: '#BFDBFE' })
      await db.categories.add({ id: otherCategoryId, name: 'Admin', color: '#FBCFE8' })
      const blockId = crypto.randomUUID()
      await db.timeBlocks.add({
        id: blockId,
        dayTemplateId,
        categoryId,
        startTime: '10:00',
        endTime: '11:00',
      })
      await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId })

      const shouldTaskId = crypto.randomUUID()
      const mustTaskId = crypto.randomUUID()
      await db.tasks.add({
        id: shouldTaskId,
        title: 'Tâche reportable',
        status: 'inbox',
        createdAt: new Date().toISOString(),
        categoryId,
        priority: 'should',
        plannedDayId: '',
        timeBlockId: null,
        checklist: [],
      })
      await db.tasks.add({
        id: mustTaskId,
        title: 'Tâche non négociable',
        status: 'inbox',
        createdAt: new Date().toISOString(),
        categoryId,
        priority: 'must',
        plannedDayId: '',
        timeBlockId: null,
        checklist: [],
      })
      await db.tasks.add({
        id: crypto.randomUUID(),
        title: "Tâche d'une autre catégorie",
        status: 'inbox',
        createdAt: new Date().toISOString(),
        categoryId: otherCategoryId,
        priority: 'must',
        plannedDayId: '',
        timeBlockId: null,
        checklist: [],
      })

      render(<TodayView />)

      fireEvent.click(await screen.findByRole('button', { name: 'Que pourrais-je faire ?' }))

      const suggestionsPanel = document.querySelector('.today-view__suggestions')
      const mustSuggestion = await within(suggestionsPanel).findByText('Tâche non négociable')
      const shouldSuggestion = within(suggestionsPanel).getByText('Tâche reportable')
      expect(within(suggestionsPanel).queryByText("Tâche d'une autre catégorie")).not.toBeInTheDocument()

      const suggestionCards = within(suggestionsPanel)
        .getAllByRole('listitem')
        .filter((el) => el.className.includes('task-card'))
      expect(suggestionCards[0]).toContainElement(mustSuggestion)
      expect(suggestionCards[1]).toContainElement(shouldSuggestion)

      const suggestionRow = mustSuggestion.closest('.task-card')
      fireEvent.change(within(suggestionRow).getByLabelText('Affecter à'), { target: { value: blockId } })

      await waitFor(async () => {
        const task = await db.tasks.get(mustTaskId)
        expect(task).toMatchObject({ timeBlockId: blockId })
      })
    })

    it("affiche une micro-copy bienveillante quand aucune tâche ne correspond", async () => {
      vi.setSystemTime(new Date('2026-07-06T08:00:00'))
      const dayTemplateId = crypto.randomUUID()
      await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
      await db.timeBlocks.add({
        id: crypto.randomUUID(),
        dayTemplateId,
        categoryId: null,
        startTime: '10:00',
        endTime: '11:00',
      })
      await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId })

      render(<TodayView />)

      fireEvent.click(await screen.findByRole('button', { name: 'Que pourrais-je faire ?' }))

      expect(
        await screen.findByText("Aucune tâche spécifique pour l'instant, quartier libre !", { exact: false }),
      ).toBeInTheDocument()
    })
  })
})
