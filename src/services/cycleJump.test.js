import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db, UNASSIGNED_PLANNED_DAY_ID } from '../db'
import { executeCycleJump } from './cycleJump'

async function makeCategory(name = 'Travail') {
  const id = crypto.randomUUID()
  await db.categories.add({ id, name, color: '#BFDBFE' })
  return id
}

async function makeDayTemplate(name = 'Journée Standard') {
  const id = crypto.randomUUID()
  await db.dayTemplates.add({ id, name })
  return id
}

async function makeTimeBlock({ dayTemplateId, categoryId, startTime = '09:00', endTime = '12:00' }) {
  const id = crypto.randomUUID()
  await db.timeBlocks.add({ id, dayTemplateId, categoryId, startTime, endTime })
  return id
}

async function makePlannedDay({ date, dayTemplateId }) {
  const id = crypto.randomUUID()
  await db.plannedDays.add({ id, date, dayTemplateId })
  return id
}

async function makeTask({ priority, categoryId, plannedDayId, timeBlockId = null, status = 'inbox' }) {
  const id = crypto.randomUUID()
  await db.tasks.add({
    id,
    title: 'Tâche de test',
    status,
    createdAt: new Date().toISOString(),
    priority,
    categoryId,
    plannedDayId,
    timeBlockId,
  })
  return id
}

describe('executeCycleJump', () => {
  beforeEach(async () => {
    await db.tasks.clear()
    await db.categories.clear()
    await db.dayTemplates.clear()
    await db.timeBlocks.clear()
    await db.plannedDays.clear()
  })

  it('déplace une tâche "should" en retard vers la prochaine plage future correspondant à sa catégorie', async () => {
    const categoryId = await makeCategory()
    const dayTemplateId = await makeDayTemplate()
    const timeBlockId = await makeTimeBlock({ dayTemplateId, categoryId })
    const pastPlannedDayId = await makePlannedDay({ date: '2026-07-05', dayTemplateId })
    const futurePlannedDayId = await makePlannedDay({ date: '2026-07-07', dayTemplateId })
    const taskId = await makeTask({
      priority: 'should',
      categoryId,
      plannedDayId: pastPlannedDayId,
      timeBlockId,
    })

    await executeCycleJump(db, '2026-07-06')

    const task = await db.tasks.get(taskId)
    expect(task.plannedDayId).toBe(futurePlannedDayId)
    expect(task.timeBlockId).toBe(timeBlockId)
  })

  it("renvoie dans l'Inbox une tâche \"could\" en retard si aucune plage future ne correspond", async () => {
    const categoryId = await makeCategory()
    const dayTemplateId = await makeDayTemplate()
    const timeBlockId = await makeTimeBlock({ dayTemplateId, categoryId })
    const pastPlannedDayId = await makePlannedDay({ date: '2026-07-05', dayTemplateId })
    const taskId = await makeTask({
      priority: 'could',
      categoryId,
      plannedDayId: pastPlannedDayId,
      timeBlockId,
    })

    await executeCycleJump(db, '2026-07-06')

    const task = await db.tasks.get(taskId)
    expect(task.plannedDayId).toBe(UNASSIGNED_PLANNED_DAY_ID)
    expect(task.timeBlockId).toBeNull()
  })

  it('ne touche jamais les tâches "must" même en retard', async () => {
    const categoryId = await makeCategory()
    const dayTemplateId = await makeDayTemplate()
    const timeBlockId = await makeTimeBlock({ dayTemplateId, categoryId })
    const pastPlannedDayId = await makePlannedDay({ date: '2026-07-05', dayTemplateId })
    await makePlannedDay({ date: '2026-07-07', dayTemplateId })
    const taskId = await makeTask({
      priority: 'must',
      categoryId,
      plannedDayId: pastPlannedDayId,
      timeBlockId,
    })

    await executeCycleJump(db, '2026-07-06')

    const task = await db.tasks.get(taskId)
    expect(task.plannedDayId).toBe(pastPlannedDayId)
    expect(task.timeBlockId).toBe(timeBlockId)
  })

  it('choisit la plage future la plus proche chronologiquement (aujourd’hui inclus)', async () => {
    const categoryId = await makeCategory()
    const pastDayTemplateId = await makeDayTemplate('Hier')
    const pastTimeBlockId = await makeTimeBlock({ dayTemplateId: pastDayTemplateId, categoryId })
    const pastPlannedDayId = await makePlannedDay({ date: '2026-07-05', dayTemplateId: pastDayTemplateId })

    const todayTemplateId = await makeDayTemplate('Aujourdhui')
    const todayTimeBlockId = await makeTimeBlock({ dayTemplateId: todayTemplateId, categoryId })
    const todayPlannedDayId = await makePlannedDay({ date: '2026-07-06', dayTemplateId: todayTemplateId })

    const tomorrowTemplateId = await makeDayTemplate('Demain')
    await makeTimeBlock({ dayTemplateId: tomorrowTemplateId, categoryId })
    await makePlannedDay({ date: '2026-07-07', dayTemplateId: tomorrowTemplateId })

    const farTemplateId = await makeDayTemplate('Dans 3 jours')
    await makeTimeBlock({ dayTemplateId: farTemplateId, categoryId })
    await makePlannedDay({ date: '2026-07-09', dayTemplateId: farTemplateId })

    const taskId = await makeTask({
      priority: 'should',
      categoryId,
      plannedDayId: pastPlannedDayId,
      timeBlockId: pastTimeBlockId,
    })

    await executeCycleJump(db, '2026-07-06')

    const task = await db.tasks.get(taskId)
    expect(task.plannedDayId).toBe(todayPlannedDayId)
    expect(task.timeBlockId).toBe(todayTimeBlockId)
  })

  it('ne déplace pas une tâche déjà planifiée sur une journée future ou le jour même', async () => {
    const categoryId = await makeCategory()
    const dayTemplateId = await makeDayTemplate()
    const timeBlockId = await makeTimeBlock({ dayTemplateId, categoryId })
    const todayPlannedDayId = await makePlannedDay({ date: '2026-07-06', dayTemplateId })
    const taskId = await makeTask({
      priority: 'should',
      categoryId,
      plannedDayId: todayPlannedDayId,
      timeBlockId,
    })

    await executeCycleJump(db, '2026-07-06')

    const task = await db.tasks.get(taskId)
    expect(task.plannedDayId).toBe(todayPlannedDayId)
    expect(task.timeBlockId).toBe(timeBlockId)
  })

  it('ignore les tâches déjà complétées même en retard', async () => {
    const categoryId = await makeCategory()
    const dayTemplateId = await makeDayTemplate()
    const timeBlockId = await makeTimeBlock({ dayTemplateId, categoryId })
    const pastPlannedDayId = await makePlannedDay({ date: '2026-07-05', dayTemplateId })
    await makePlannedDay({ date: '2026-07-07', dayTemplateId })
    const taskId = await makeTask({
      priority: 'should',
      categoryId,
      plannedDayId: pastPlannedDayId,
      timeBlockId,
      status: 'completed',
    })

    await executeCycleJump(db, '2026-07-06')

    const task = await db.tasks.get(taskId)
    expect(task.plannedDayId).toBe(pastPlannedDayId)
    expect(task.timeBlockId).toBe(timeBlockId)
  })

  it('ne fait rien et ne lève aucune erreur en l’absence de tâches en retard', async () => {
    await expect(executeCycleJump(db, '2026-07-06')).resolves.toBeUndefined()
  })

  it('traite une tâche jamais triée (priority: null) comme "could" plutôt que de la figer', async () => {
    const categoryId = await makeCategory()
    const dayTemplateId = await makeDayTemplate()
    const timeBlockId = await makeTimeBlock({ dayTemplateId, categoryId })
    const pastPlannedDayId = await makePlannedDay({ date: '2026-07-05', dayTemplateId })
    const futurePlannedDayId = await makePlannedDay({ date: '2026-07-07', dayTemplateId })
    const taskId = await makeTask({
      priority: null,
      categoryId,
      plannedDayId: pastPlannedDayId,
      timeBlockId,
    })

    await executeCycleJump(db, '2026-07-06')

    const task = await db.tasks.get(taskId)
    expect(task.plannedDayId).toBe(futurePlannedDayId)
    expect(task.timeBlockId).toBe(timeBlockId)
  })

  it('avale silencieusement une erreur de transaction sans jamais la laisser remonter', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const transactionError = new Error('échec simulé de la transaction Dexie')
    const transactionSpy = vi.spyOn(db, 'transaction').mockRejectedValueOnce(transactionError)

    await expect(executeCycleJump(db, '2026-07-06')).resolves.toBeUndefined()
    expect(consoleErrorSpy).toHaveBeenCalledWith(transactionError)

    transactionSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })
})
