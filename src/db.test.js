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

  it('exposes a dayTemplates table with UUID v4 ids and a name', async () => {
    await db.dayTemplates.clear()

    const id = crypto.randomUUID()
    await db.dayTemplates.add({ id, name: 'Télétravail' })

    const dayTemplate = await db.dayTemplates.get(id)

    expect(dayTemplate).toMatchObject({ id, name: 'Télétravail' })
    expect(dayTemplate.id).toMatch(UUID_V4_REGEX)
  })

  it('exposes a timeBlocks table linked to a dayTemplate and a category', async () => {
    await db.dayTemplates.clear()
    await db.timeBlocks.clear()

    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })

    const categoryId = crypto.randomUUID()
    await db.categories.add({ id: categoryId, name: 'Travail', color: '#BFDBFE' })

    const timeBlockId = crypto.randomUUID()
    await db.timeBlocks.add({
      id: timeBlockId,
      dayTemplateId,
      categoryId,
      startTime: '09:00',
      endTime: '12:00',
    })

    const timeBlock = await db.timeBlocks.get(timeBlockId)

    expect(timeBlock).toMatchObject({
      id: timeBlockId,
      dayTemplateId,
      categoryId,
      startTime: '09:00',
      endTime: '12:00',
    })
    expect(timeBlock.id).toMatch(UUID_V4_REGEX)
  })

  it('lets a task reference a timeBlock via timeBlockId', async () => {
    await db.dayTemplates.clear()
    await db.timeBlocks.clear()

    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })

    const timeBlockId = crypto.randomUUID()
    await db.timeBlocks.add({
      id: timeBlockId,
      dayTemplateId,
      categoryId: null,
      startTime: '09:00',
      endTime: '12:00',
    })

    const taskId = crypto.randomUUID()
    await db.tasks.add({
      id: taskId,
      title: 'Préparer le rapport',
      status: 'inbox',
      createdAt: new Date().toISOString(),
      category: null,
      priority: null,
      categoryId: null,
      plannedDayId: null,
      timeBlockId,
      checklist: [],
    })

    const task = await db.tasks.get(taskId)
    expect(task.timeBlockId).toBe(timeBlockId)
  })

  it('exposes a plannedDays table linked to a dayTemplate for a given date', async () => {
    await db.dayTemplates.clear()
    await db.plannedDays.clear()

    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })

    const plannedDayId = crypto.randomUUID()
    await db.plannedDays.add({ id: plannedDayId, date: '2026-07-06', dayTemplateId })

    const plannedDay = await db.plannedDays.get(plannedDayId)

    expect(plannedDay).toMatchObject({
      id: plannedDayId,
      date: '2026-07-06',
      dayTemplateId,
    })
    expect(plannedDay.id).toMatch(UUID_V4_REGEX)
  })

  it('rejects a second plannedDay for a date that is already planned', async () => {
    await db.dayTemplates.clear()
    await db.plannedDays.clear()

    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId })

    await expect(
      db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId }),
    ).rejects.toThrow()
  })
})
