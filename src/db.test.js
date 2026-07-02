import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'

describe('db', () => {
  beforeEach(async () => {
    await db.tasks.clear()
  })

  it('exposes a tasks table with the expected schema fields', async () => {
    const id = await db.tasks.add({
      title: 'Acheter du pain',
      status: 'inbox',
      createdAt: new Date().toISOString(),
      category: null,
      priority: null,
    })

    const task = await db.tasks.get(id)

    expect(task).toMatchObject({
      title: 'Acheter du pain',
      status: 'inbox',
      category: null,
      priority: null,
    })
    expect(task.createdAt).toBeTypeOf('string')
  })
})
