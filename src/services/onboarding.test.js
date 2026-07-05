import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { db } from '../db'
import { ensureOnboarding } from './onboarding'

describe('ensureOnboarding', () => {
  beforeEach(async () => {
    vi.setSystemTime(new Date('2026-07-06T10:00:00'))
    await db.categories.clear()
    await db.dayTemplates.clear()
    await db.timeBlocks.clear()
    await db.plannedDays.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('silently generates a standard day template, categories and time blocks on an empty database', async () => {
    await ensureOnboarding()

    const categories = await db.categories.toArray()
    const dayTemplates = await db.dayTemplates.toArray()
    expect(categories.length).toBeGreaterThan(0)
    expect(dayTemplates).toHaveLength(1)
    expect(dayTemplates[0].name).toBe('Journée Standard')

    const timeBlocks = await db.timeBlocks.where('dayTemplateId').equals(dayTemplates[0].id).toArray()
    expect(timeBlocks.length).toBeGreaterThan(0)
    for (const block of timeBlocks) {
      expect(categories.some((category) => category.id === block.categoryId)).toBe(true)
    }
  })

  it('plans the standard day template for today', async () => {
    await ensureOnboarding()

    const dayTemplates = await db.dayTemplates.toArray()
    const plannedDay = await db.plannedDays.where('date').equals('2026-07-06').first()

    expect(plannedDay).toBeDefined()
    expect(plannedDay.dayTemplateId).toBe(dayTemplates[0].id)
  })

  it('is idempotent: does not touch categories or day templates that already exist', async () => {
    const existingTemplateId = crypto.randomUUID()
    await db.categories.add({ id: crypto.randomUUID(), name: 'Existant', color: '#000000' })
    await db.dayTemplates.add({ id: existingTemplateId, name: 'Existant' })

    await ensureOnboarding()

    const dayTemplates = await db.dayTemplates.toArray()
    const categories = await db.categories.toArray()
    expect(dayTemplates).toHaveLength(1)
    expect(dayTemplates[0].id).toBe(existingTemplateId)
    expect(categories).toHaveLength(1)
  })

  it('still generates the standard day template if a category already exists but no day template does', async () => {
    await db.categories.add({ id: crypto.randomUUID(), name: 'Existant', color: '#000000' })

    await ensureOnboarding()

    const dayTemplates = await db.dayTemplates.toArray()
    const categories = await db.categories.toArray()
    expect(dayTemplates).toHaveLength(1)
    expect(dayTemplates[0].name).toBe('Journée Standard')
    expect(categories).toHaveLength(1)

    const timeBlocks = await db.timeBlocks.where('dayTemplateId').equals(dayTemplates[0].id).toArray()
    expect(timeBlocks.length).toBeGreaterThan(0)
    for (const block of timeBlocks) {
      expect(block.categoryId).toBe(categories[0].id)
    }
  })

  it('does not overwrite an already planned day for today', async () => {
    const existingTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: existingTemplateId, name: 'Autre modèle' })
    await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId: existingTemplateId })

    await ensureOnboarding()

    const plannedDays = await db.plannedDays.toArray()
    expect(plannedDays).toHaveLength(1)
    expect(plannedDays[0].dayTemplateId).toBe(existingTemplateId)
  })
})
