import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { TaskCard } from './TaskCard'
import { db } from '../db'

beforeAll(() => {
  window.HTMLElement.prototype.setPointerCapture = () => {}
  window.HTMLElement.prototype.releasePointerCapture = () => {}
  window.HTMLElement.prototype.hasPointerCapture = () => true
  // jsdom doesn't implement elementFromPoint at all (throws "not a function"); the
  // drop-target hit-testing needs a stub, overridden per test for drop scenarios.
  document.elementFromPoint = () => null
})

describe('TaskCard', () => {
  beforeEach(async () => {
    await db.tasks.clear()
    await db.categories.clear()
  })

  afterEach(() => {
    // Plusieurs tests remplacent document.elementFromPoint par un stub dédié ;
    // le réinitialiser évite toute fuite d'état global vers le test suivant.
    document.elementFromPoint = () => null
  })

  async function addTask(overrides = {}) {
    const id = crypto.randomUUID()
    await db.tasks.add({
      id,
      title: 'Faire les courses',
      status: 'inbox',
      createdAt: new Date().toISOString(),
      category: null,
      priority: null,
      categoryId: null,
      plannedDayId: null,
      checklist: [],
      ...overrides,
    })
    return db.tasks.get(id)
  }

  it('still toggles completion via the checkbox (no regression)', async () => {
    const task = await addTask()
    render(<TaskCard task={task} />)

    fireEvent.click(screen.getByRole('checkbox'))

    await waitFor(async () => {
      const updated = await db.tasks.get(task.id)
      expect(updated.status).toBe('completed')
    })
  })

  it('opens the enrichment panel via the edit button', async () => {
    const task = await addTask()
    render(<TaskCard task={task} />)

    expect(screen.queryByText('Priorité')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Modifier la tâche' }))

    expect(screen.getByText('Priorité')).toBeInTheDocument()
  })

  it('opens the enrichment panel on a rightward swipe', async () => {
    const task = await addTask()
    const { container } = render(<TaskCard task={task} />)

    const card = container.querySelector('.task-card')
    fireEvent.pointerDown(card, { clientX: 0, pointerId: 1, isPrimary: true })
    fireEvent.pointerUp(card, { clientX: 90, pointerId: 1, isPrimary: true })

    expect(screen.getByText('Priorité')).toBeInTheDocument()
  })

  it('does not open the enrichment panel on a short/accidental movement', async () => {
    const task = await addTask()
    const { container } = render(<TaskCard task={task} />)

    const card = container.querySelector('.task-card')
    fireEvent.pointerDown(card, { clientX: 0, pointerId: 1, isPrimary: true })
    fireEvent.pointerUp(card, { clientX: 10, pointerId: 1, isPrimary: true })

    expect(screen.queryByText('Priorité')).not.toBeInTheDocument()
  })

  it('renders category and priority tags when set', async () => {
    const categoryId = crypto.randomUUID()
    await db.categories.add({ id: categoryId, name: 'Maison', color: '#FDE68A' })
    const task = await addTask({ categoryId, priority: 'must' })

    const categoriesMap = { [categoryId]: { id: categoryId, name: 'Maison', color: '#FDE68A' } }
    render(<TaskCard task={task} categoriesMap={categoriesMap} />)

    expect(await screen.findByText('Maison')).toBeInTheDocument()
    expect(screen.getByText('Non négociable')).toBeInTheDocument()
  })

  it('renders no tags when category and priority are unset', async () => {
    const task = await addTask()
    render(<TaskCard task={task} />)

    expect(screen.queryByText('Non négociable')).not.toBeInTheDocument()
  })

  it('renders checklist items with their own checkbox and toggles them independently', async () => {
    const itemDone = { id: crypto.randomUUID(), text: 'Acheter du pain', isCompleted: true }
    const itemTodo = { id: crypto.randomUUID(), text: 'Acheter du lait', isCompleted: false }
    const task = await addTask({ checklist: [itemDone, itemTodo] })
    render(<TaskCard task={task} />)

    const doneCheckbox = screen.getByRole('checkbox', { name: 'Acheter du pain' })
    const todoCheckbox = screen.getByRole('checkbox', { name: 'Acheter du lait' })
    expect(doneCheckbox).toBeChecked()
    expect(todoCheckbox).not.toBeChecked()

    fireEvent.click(todoCheckbox)

    await waitFor(async () => {
      const updated = await db.tasks.get(task.id)
      expect(updated.checklist.find((item) => item.id === itemTodo.id).isCompleted).toBe(true)
      expect(updated.checklist.find((item) => item.id === itemDone.id).isCompleted).toBe(true)
    })
  })

  it('does not toggle the parent task status when checking a checklist item', async () => {
    const item = { id: crypto.randomUUID(), text: 'Préparer le sac', isCompleted: false }
    const task = await addTask({ checklist: [item] })
    render(<TaskCard task={task} />)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Préparer le sac' }))

    await waitFor(async () => {
      const updated = await db.tasks.get(task.id)
      expect(updated.checklist[0].isCompleted).toBe(true)
    })

    const updated = await db.tasks.get(task.id)
    expect(updated.status).toBe('inbox')
  })

  it('renders no checklist section when the checklist is empty', async () => {
    const task = await addTask()
    const { container } = render(<TaskCard task={task} />)

    expect(container.querySelector('.task-card__checklist')).not.toBeInTheDocument()
  })

  describe('drag & drop (Story 3.1)', () => {
    it('picks up the card visually on a non-horizontal move when draggable', async () => {
      const task = await addTask()
      const { container } = render(<TaskCard task={task} draggable onDrop={() => {}} />)

      const card = container.querySelector('.task-card')
      fireEvent.pointerDown(card, { clientX: 0, clientY: 0, pointerId: 1, isPrimary: true })
      fireEvent.pointerMove(card, { clientX: 5, clientY: 40, pointerId: 1, isPrimary: true })

      expect(card.className).toContain('task-card--dragging')
      expect(card.style.transform).toBe('translate(5px, 40px)')
    })

    it('calls onDrop with the resolved block id and resets position on a valid drop', async () => {
      const task = await addTask()
      const onDrop = vi.fn()
      const blockEl = document.createElement('li')
      blockEl.dataset.timeBlock = 'block-1'
      document.elementFromPoint = () => blockEl

      const { container } = render(<TaskCard task={task} draggable onDrop={onDrop} />)
      const card = container.querySelector('.task-card')
      fireEvent.pointerDown(card, { clientX: 0, clientY: 0, pointerId: 1, isPrimary: true })
      fireEvent.pointerMove(card, { clientX: 5, clientY: 40, pointerId: 1, isPrimary: true })
      fireEvent.pointerUp(card, { clientX: 5, clientY: 40, pointerId: 1, isPrimary: true })

      expect(onDrop).toHaveBeenCalledWith(task.id, 'block-1')
      expect(card.className).not.toContain('task-card--dragging')
      expect(card.style.transform).toBe('')
    })

    it('does not call onDrop and snaps back when released outside any drop zone', async () => {
      const task = await addTask()
      const onDrop = vi.fn()
      document.elementFromPoint = () => null

      const { container } = render(<TaskCard task={task} draggable onDrop={onDrop} />)
      const card = container.querySelector('.task-card')
      fireEvent.pointerDown(card, { clientX: 0, clientY: 0, pointerId: 1, isPrimary: true })
      fireEvent.pointerMove(card, { clientX: 5, clientY: 40, pointerId: 1, isPrimary: true })
      fireEvent.pointerUp(card, { clientX: 5, clientY: 40, pointerId: 1, isPrimary: true })

      expect(onDrop).not.toHaveBeenCalled()
      expect(card.className).not.toContain('task-card--dragging')
      expect(card.style.transform).toBe('')
    })

    it('still opens the enrichment panel on a pure horizontal swipe when draggable (no regression)', async () => {
      const task = await addTask()
      const { container } = render(<TaskCard task={task} draggable onDrop={() => {}} />)

      const card = container.querySelector('.task-card')
      fireEvent.pointerDown(card, { clientX: 0, clientY: 0, pointerId: 1, isPrimary: true })
      fireEvent.pointerMove(card, { clientX: 90, clientY: 0, pointerId: 1, isPrimary: true })
      fireEvent.pointerUp(card, { clientX: 90, clientY: 0, pointerId: 1, isPrimary: true })

      expect(screen.getByText('Priorité')).toBeInTheDocument()
      expect(card.className).not.toContain('task-card--dragging')
    })

    it('un-assigns the task on a leftward swipe when it is assigned to a time block', async () => {
      const task = await addTask({ plannedDayId: 'day-1', timeBlockId: 'block-1' })
      const onUnassign = vi.fn()
      const { container } = render(<TaskCard task={task} onUnassign={onUnassign} />)

      const card = container.querySelector('.task-card')
      fireEvent.pointerDown(card, { clientX: 90, clientY: 0, pointerId: 1, isPrimary: true })
      fireEvent.pointerUp(card, { clientX: 0, clientY: 0, pointerId: 1, isPrimary: true })

      expect(onUnassign).toHaveBeenCalledWith(task.id)
    })

    it('follows the finger horizontally during a swipe and springs back on release', async () => {
      const task = await addTask({ plannedDayId: 'day-1', timeBlockId: 'block-1' })
      const { container } = render(<TaskCard task={task} onUnassign={() => {}} />)

      const card = container.querySelector('.task-card')
      fireEvent.pointerDown(card, { clientX: 90, clientY: 0, pointerId: 1, isPrimary: true })
      fireEvent.pointerMove(card, { clientX: 40, clientY: 0, pointerId: 1, isPrimary: true })

      expect(card.className).toContain('task-card--swiping')
      expect(card.style.transform).toBe('translateX(-50px)')

      fireEvent.pointerUp(card, { clientX: 0, clientY: 0, pointerId: 1, isPrimary: true })

      expect(card.className).not.toContain('task-card--swiping')
      expect(card.style.transform).toBe('')
    })

    it('shows a Retirer button for a task assigned to a block and calls onUnassign', async () => {
      const task = await addTask({ plannedDayId: 'day-1', timeBlockId: 'block-1' })
      const onUnassign = vi.fn()
      render(<TaskCard task={task} onUnassign={onUnassign} />)

      fireEvent.click(screen.getByRole('button', { name: 'Retirer' }))

      expect(onUnassign).toHaveBeenCalledWith(task.id)
    })

    it('ignores drag and swipe gestures while disabled', async () => {
      const task = await addTask({ plannedDayId: 'day-1', timeBlockId: 'block-1' })
      const onUnassign = vi.fn()
      const { container } = render(<TaskCard task={task} onUnassign={onUnassign} disabled />)

      const card = container.querySelector('.task-card')
      fireEvent.pointerDown(card, { clientX: 90, clientY: 0, pointerId: 1, isPrimary: true })
      fireEvent.pointerUp(card, { clientX: 0, clientY: 0, pointerId: 1, isPrimary: true })

      expect(onUnassign).not.toHaveBeenCalled()
      expect(card.className).not.toContain('task-card--swiping')
    })

    it('closes the enrichment panel on a leftward swipe instead of unassigning when both apply', async () => {
      const task = await addTask({ plannedDayId: 'day-1', timeBlockId: 'block-1' })
      const onUnassign = vi.fn()
      render(<TaskCard task={task} onUnassign={onUnassign} />)

      fireEvent.click(screen.getByRole('button', { name: 'Modifier la tâche' }))
      expect(screen.getByText('Priorité')).toBeInTheDocument()

      const card = screen.getByText('Priorité').closest('.task-card')
      fireEvent.pointerDown(card, { clientX: 90, clientY: 0, pointerId: 1, isPrimary: true })
      fireEvent.pointerUp(card, { clientX: 0, clientY: 0, pointerId: 1, isPrimary: true })

      expect(screen.queryByText('Priorité')).not.toBeInTheDocument()
      expect(onUnassign).not.toHaveBeenCalled()
    })

    it('shows an accessible assign selector for an unassigned task and calls onAssign', async () => {
      const task = await addTask()
      const onAssign = vi.fn()
      render(
        <TaskCard
          task={task}
          onAssign={onAssign}
          assignOptions={[{ id: 'block-1', label: '10:00 – 11:00' }]}
        />,
      )

      fireEvent.change(screen.getByLabelText('Affecter à'), { target: { value: 'block-1' } })

      expect(onAssign).toHaveBeenCalledWith(task.id, 'block-1')
    })
  })

  describe('stagnation suggestion (Story 3.3)', () => {
    // Horloge figée plutôt que Date.now() réel au chargement du fichier : les
    // assertions sur les seuils (48h, tick périodique) restent déterministes
    // quelle que soit la durée d'exécution de la suite.
    const NOW = new Date('2026-07-06T12:00:00.000Z').getTime()
    const STAGNANT_CREATED_AT = new Date(NOW - 50 * 60 * 60 * 1000).toISOString()
    const FRESH_CREATED_AT = new Date(NOW - 2 * 60 * 60 * 1000).toISOString()

    beforeEach(() => {
      // shouldAdvanceTime laisse les micro/macrotâches réelles (fake-indexeddb,
      // testing-library) s'exécuter normalement ; seule Date.now()/new Date()
      // est figée.
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.setSystemTime(NOW)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('suggests assigning a category when the task has stagnated in the Dépôt for more than 48h', async () => {
      const task = await addTask({ createdAt: STAGNANT_CREATED_AT, categoryId: null, timeBlockId: null })
      render(<TaskCard task={task} />)

      const editButton = screen.getByRole('button', { name: 'Modifier la tâche (catégorie suggérée)' })
      expect(editButton.className).toContain('task-card__edit-button--stagnant')
    })

    it('does not suggest a category when the task already has one', async () => {
      const categoryId = crypto.randomUUID()
      await db.categories.add({ id: categoryId, name: 'Maison', color: '#FDE68A' })
      const task = await addTask({ createdAt: STAGNANT_CREATED_AT, categoryId, timeBlockId: null })
      render(<TaskCard task={task} />)

      const editButton = screen.getByRole('button', { name: 'Modifier la tâche' })
      expect(editButton.className).not.toContain('task-card__edit-button--stagnant')
    })

    it('does not suggest a category when createdAt is missing (legacy data)', async () => {
      // new Date(null/undefined) résout à l'epoch (1970), donc sans garde
      // explicite une tâche sans createdAt serait à tort perçue comme stagnante.
      const task = await addTask({ createdAt: null, categoryId: null, timeBlockId: null })
      render(<TaskCard task={task} />)

      const editButton = screen.getByRole('button', { name: 'Modifier la tâche' })
      expect(editButton.className).not.toContain('task-card__edit-button--stagnant')
    })

    it('does not suggest a category for a task created less than 48h ago', async () => {
      const task = await addTask({ createdAt: FRESH_CREATED_AT, categoryId: null, timeBlockId: null })
      render(<TaskCard task={task} />)

      const editButton = screen.getByRole('button', { name: 'Modifier la tâche' })
      expect(editButton.className).not.toContain('task-card__edit-button--stagnant')
    })

    it('does not suggest a category for a completed task', async () => {
      const task = await addTask({
        createdAt: STAGNANT_CREATED_AT,
        categoryId: null,
        timeBlockId: null,
        status: 'completed',
      })
      render(<TaskCard task={task} />)

      const editButton = screen.getByRole('button', { name: 'Modifier la tâche' })
      expect(editButton.className).not.toContain('task-card__edit-button--stagnant')
    })

    it('does not suggest a category for a task already assigned to a time block', async () => {
      const task = await addTask({
        createdAt: STAGNANT_CREATED_AT,
        categoryId: null,
        plannedDayId: 'day-1',
        timeBlockId: 'block-1',
      })
      render(<TaskCard task={task} onUnassign={() => {}} />)

      const editButton = screen.getByRole('button', { name: 'Modifier la tâche' })
      expect(editButton.className).not.toContain('task-card__edit-button--stagnant')
    })

    it('does not suggest a category for a task already planned for a day, even if not yet assigned to a time block', async () => {
      // Une tâche affectée à un jour précis (plannedDayId réel) n'est plus dans le
      // Dépôt, même si elle n'a pas encore de plage horaire (timeBlockId null) :
      // l'AC ne cible que les tâches qui stagnent dans le Dépôt.
      const task = await addTask({
        createdAt: STAGNANT_CREATED_AT,
        categoryId: null,
        plannedDayId: 'day-1',
        timeBlockId: null,
      })
      render(<TaskCard task={task} assignOptions={[{ id: 'block-1', label: '10:00 – 11:00' }]} />)

      const editButton = screen.getByRole('button', { name: 'Modifier la tâche' })
      expect(editButton.className).not.toContain('task-card__edit-button--stagnant')
    })

    it('re-evaluates stagnation over time without an unrelated re-render', async () => {
      const task = await addTask({
        createdAt: new Date(NOW - 47 * 60 * 60 * 1000).toISOString(),
        categoryId: null,
        timeBlockId: null,
      })
      render(<TaskCard task={task} />)

      expect(screen.getByRole('button', { name: 'Modifier la tâche' })).toBeInTheDocument()

      // Fait franchir le seuil de 48h sans déclencher de re-render externe :
      // seul le tick périodique interne doit rafraîchir l'indicateur.
      vi.setSystemTime(NOW - 47 * 60 * 60 * 1000 + 49 * 60 * 60 * 1000)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(15 * 60 * 1000)
      })

      expect(screen.getByRole('button', { name: 'Modifier la tâche (catégorie suggérée)' })).toBeInTheDocument()
    })
  })
})
