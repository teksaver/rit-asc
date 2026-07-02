import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('db', () => {
  beforeEach(async () => {
    await db.tasks.clear()
  })

  it('exposes a tasks table with the expected schema fields', async () => {
    const id = crypto.randomUUID()
    await db.tasks.add({
      id,
      title: 'Acheter du pain',
      status: 'inbox',
      createdAt: new Date().toISOString(),
      category: null,
      priority: null,
      categoryId: null,
      plannedDayId: null,
      checklist: [],
    })

    const task = await db.tasks.get(id)

    expect(task).toMatchObject({
      id,
      title: 'Acheter du pain',
      status: 'inbox',
      category: null,
      priority: null,
      categoryId: null,
      plannedDayId: null,
      checklist: [],
    })
    expect(task.id).toMatch(UUID_V4_REGEX)
    expect(task.createdAt).toBeTypeOf('string')
  })

  it('exposes a categories table with UUID v4 ids, a name, and a color', async () => {
    await db.categories.clear()

    const id = crypto.randomUUID()
    await db.categories.add({ id, name: 'Maison', color: '#FDE68A' })

    const category = await db.categories.get(id)

    expect(category).toMatchObject({ id, name: 'Maison', color: '#FDE68A' })
    expect(category.id).toMatch(UUID_V4_REGEX)
  })

  it('lets a task reference a category via categoryId', async () => {
    const categoryId = crypto.randomUUID()
    await db.categories.add({ id: categoryId, name: 'Travail', color: '#BFDBFE' })

    const taskId = crypto.randomUUID()
    await db.tasks.add({
      id: taskId,
      title: 'Préparer la réunion',
      status: 'inbox',
      createdAt: new Date().toISOString(),
      category: null,
      priority: null,
      categoryId,
      plannedDayId: null,
      checklist: [],
    })

    const task = await db.tasks.get(taskId)
    expect(task.categoryId).toBe(categoryId)
  })
})
