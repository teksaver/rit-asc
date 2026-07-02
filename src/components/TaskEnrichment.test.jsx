import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskEnrichment } from './TaskEnrichment'
import { db } from '../db'

describe('TaskEnrichment', () => {
  beforeEach(async () => {
    await db.tasks.clear()
    await db.categories.clear()
  })

  async function addTask(overrides = {}) {
    const id = crypto.randomUUID()
    await db.tasks.add({
      id,
      title: 'Tâche test',
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

  it('defaults to "could" priority when the task has none set', async () => {
    const task = await addTask()
    render(<TaskEnrichment task={task} />)

    const couldPill = screen.getByRole('button', { name: 'Vraiment pas obligé' })
    expect(couldPill).toHaveAttribute('aria-pressed', 'true')
  })

  it('persists priority selection to Dexie', async () => {
    const task = await addTask()
    render(<TaskEnrichment task={task} />)

    fireEvent.click(screen.getByRole('button', { name: 'Non négociable' }))

    await waitFor(async () => {
      const updated = await db.tasks.get(task.id)
      expect(updated.priority).toBe('must')
    })
  })

  it('creates a new category on the fly and assigns it to the task', async () => {
    const task = await addTask()
    render(<TaskEnrichment task={task} />)

    const input = screen.getByLabelText('Créer une nouvelle catégorie')
    fireEvent.change(input, { target: { value: 'Maison' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(async () => {
      const categories = await db.categories.toArray()
      expect(categories).toHaveLength(1)
      expect(categories[0]).toMatchObject({ name: 'Maison' })

      const updated = await db.tasks.get(task.id)
      expect(updated.categoryId).toBe(categories[0].id)
    })
  })

  it('reuses an existing category instead of creating a duplicate (case-insensitive)', async () => {
    const existingId = crypto.randomUUID()
    await db.categories.add({ id: existingId, name: 'Travail', color: '#BFDBFE' })
    const task = await addTask()
    render(<TaskEnrichment task={task} />)

    const input = await screen.findByLabelText('Créer une nouvelle catégorie')
    fireEvent.change(input, { target: { value: 'travail' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(async () => {
      const categories = await db.categories.toArray()
      expect(categories).toHaveLength(1)

      const updated = await db.tasks.get(task.id)
      expect(updated.categoryId).toBe(existingId)
    })
  })

  it('assigns an existing category when its chip is clicked', async () => {
    const existingId = crypto.randomUUID()
    await db.categories.add({ id: existingId, name: 'Sport', color: '#BBF7D0' })
    const task = await addTask()
    render(<TaskEnrichment task={task} />)

    const chip = await screen.findByRole('button', { name: 'Sport' })
    fireEvent.click(chip)

    await waitFor(async () => {
      const updated = await db.tasks.get(task.id)
      expect(updated.categoryId).toBe(existingId)
    })
  })
})
