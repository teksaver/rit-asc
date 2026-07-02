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
})
