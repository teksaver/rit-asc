import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskCard } from './TaskCard'
import { db } from '../db'

beforeAll(() => {
  window.HTMLElement.prototype.setPointerCapture = () => {}
  window.HTMLElement.prototype.releasePointerCapture = () => {}
})

describe('TaskCard', () => {
  beforeEach(async () => {
    await db.tasks.clear()
    await db.categories.clear()
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
})
