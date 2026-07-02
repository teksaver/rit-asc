import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskCard } from './TaskCard'
import { db } from '../db'

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
    fireEvent.pointerDown(card, { clientX: 0, pointerId: 1 })
    fireEvent.pointerUp(card, { clientX: 90, pointerId: 1 })

    expect(screen.getByText('Priorité')).toBeInTheDocument()
  })

  it('does not open the enrichment panel on a short/accidental movement', async () => {
    const task = await addTask()
    const { container } = render(<TaskCard task={task} />)

    const card = container.querySelector('.task-card')
    fireEvent.pointerDown(card, { clientX: 0, pointerId: 1 })
    fireEvent.pointerUp(card, { clientX: 10, pointerId: 1 })

    expect(screen.queryByText('Priorité')).not.toBeInTheDocument()
  })

  it('renders category and priority tags when set', async () => {
    const categoryId = crypto.randomUUID()
    await db.categories.add({ id: categoryId, name: 'Maison', color: '#FDE68A' })
    const task = await addTask({ categoryId, priority: 'must' })

    render(<TaskCard task={task} />)

    expect(await screen.findByText('Maison')).toBeInTheDocument()
    expect(screen.getByText('Non négociable')).toBeInTheDocument()
  })

  it('renders no tags when category and priority are unset', async () => {
    const task = await addTask()
    render(<TaskCard task={task} />)

    expect(screen.queryByText('Non négociable')).not.toBeInTheDocument()
  })
})
