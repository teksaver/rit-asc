import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskList } from './TaskList'
import { db } from '../db'

beforeAll(() => {
  window.HTMLElement.prototype.setPointerCapture = () => {}
  window.HTMLElement.prototype.releasePointerCapture = () => {}
  window.HTMLElement.prototype.hasPointerCapture = () => true
})

describe('TaskList', () => {
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
      plannedDayId: '',
      timeBlockId: null,
      checklist: [],
      ...overrides,
    })
    return id
  }

  it('shows inbox tasks that are not yet planned', async () => {
    await addTask({ title: 'Tâche non planifiée' })

    render(<TaskList />)

    expect(await screen.findByText('Tâche non planifiée')).toBeInTheDocument()
  })

  it('hides tasks already assigned to a PlannedDay', async () => {
    await addTask({ title: 'Tâche déjà planifiée', plannedDayId: crypto.randomUUID() })

    render(<TaskList />)

    expect(await screen.findByText("Votre dépôt est vide. Videz-vous l'esprit ci-dessous.")).toBeInTheDocument()
    expect(screen.queryByText('Tâche déjà planifiée')).not.toBeInTheDocument()
  })
})
