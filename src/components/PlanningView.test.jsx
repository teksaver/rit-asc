import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { PlanningView } from './PlanningView'
import { db } from '../db'

describe('PlanningView', () => {
  beforeEach(async () => {
    await db.dayTemplates.clear()
    await db.plannedDays.clear()
    // Monday 2026-07-06: keeps the displayed week deterministic across runs.
    vi.setSystemTime(new Date('2026-07-06T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('lists the 7 days of the current week starting on Monday', async () => {
    render(<PlanningView />)

    expect(await screen.findByText(/lundi 06\/07/i)).toBeInTheDocument()
    expect(screen.getByText(/dimanche 12\/07/i)).toBeInTheDocument()
  })

  it('assigns a day template to a date and stores a PlannedDay', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })

    render(<PlanningView />)

    const mondayRow = (await screen.findByText(/lundi 06\/07/i)).closest('[data-planning-row]')
    fireEvent.change(within(mondayRow).getByLabelText('Journée type'), {
      target: { value: dayTemplateId },
    })
    fireEvent.click(within(mondayRow).getByRole('button', { name: 'Assigner' }))

    await waitFor(async () => {
      const plannedDays = await db.plannedDays.toArray()
      expect(plannedDays).toHaveLength(1)
      expect(plannedDays[0]).toMatchObject({ date: '2026-07-06', dayTemplateId })
    })

    expect(await within(mondayRow).findByText('Actuellement : Télétravail')).toBeInTheDocument()
  })

  it('asks for confirmation before overwriting an existing PlannedDay', async () => {
    const teletravailId = crypto.randomUUID()
    const weekendId = crypto.randomUUID()
    await db.dayTemplates.add({ id: teletravailId, name: 'Télétravail' })
    await db.dayTemplates.add({ id: weekendId, name: 'Week-end' })
    await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId: teletravailId })

    render(<PlanningView />)

    const mondayRow = (await screen.findByText(/lundi 06\/07/i)).closest('[data-planning-row]')
    await within(mondayRow).findByText('Actuellement : Télétravail')
    fireEvent.change(within(mondayRow).getByLabelText('Journée type'), {
      target: { value: weekendId },
    })
    fireEvent.click(within(mondayRow).getByRole('button', { name: 'Assigner' }))

    expect(await screen.findByRole('button', { name: 'Confirmer' })).toBeInTheDocument()

    let plannedDays = await db.plannedDays.toArray()
    expect(plannedDays).toHaveLength(1)
    expect(plannedDays[0].dayTemplateId).toBe(teletravailId)

    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

    await waitFor(async () => {
      plannedDays = await db.plannedDays.toArray()
      expect(plannedDays).toHaveLength(1)
      expect(plannedDays[0].dayTemplateId).toBe(weekendId)
    })
  })

  it('ignores a second assignment attempt while a confirmation dialog is pending (anti mitraillette)', async () => {
    const teletravailId = crypto.randomUUID()
    const weekendId = crypto.randomUUID()
    await db.dayTemplates.add({ id: teletravailId, name: 'Télétravail' })
    await db.dayTemplates.add({ id: weekendId, name: 'Week-end' })
    await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId: teletravailId })
    await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-07', dayTemplateId: teletravailId })

    render(<PlanningView />)

    const mondayRow = (await screen.findByText(/lundi 06\/07/i)).closest('[data-planning-row]')
    await within(mondayRow).findByText('Actuellement : Télétravail')
    const tuesdayRow = (await screen.findByText(/mardi 07\/07/i)).closest('[data-planning-row]')
    await within(tuesdayRow).findByText('Actuellement : Télétravail')

    fireEvent.change(within(mondayRow).getByLabelText('Journée type'), { target: { value: weekendId } })
    fireEvent.click(within(mondayRow).getByRole('button', { name: 'Assigner' }))
    expect(await screen.findByRole('button', { name: 'Confirmer' })).toBeInTheDocument()

    // While the Monday confirmation is pending, trying to assign Tuesday must be a no-op.
    fireEvent.change(within(tuesdayRow).getByLabelText('Journée type'), { target: { value: weekendId } })
    fireEvent.click(within(tuesdayRow).getByRole('button', { name: 'Assigner' }))

    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

    await waitFor(async () => {
      const plannedDays = await db.plannedDays.toArray()
      const monday = plannedDays.find((p) => p.date === '2026-07-06')
      const tuesday = plannedDays.find((p) => p.date === '2026-07-07')
      expect(monday.dayTemplateId).toBe(weekendId)
      expect(tuesday.dayTemplateId).toBe(teletravailId)
    })
  })

  it('cancels an overwrite without changing the existing PlannedDay', async () => {
    const teletravailId = crypto.randomUUID()
    const weekendId = crypto.randomUUID()
    await db.dayTemplates.add({ id: teletravailId, name: 'Télétravail' })
    await db.dayTemplates.add({ id: weekendId, name: 'Week-end' })
    await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId: teletravailId })

    render(<PlanningView />)

    const mondayRow = (await screen.findByText(/lundi 06\/07/i)).closest('[data-planning-row]')
    await within(mondayRow).findByText('Actuellement : Télétravail')
    fireEvent.change(within(mondayRow).getByLabelText('Journée type'), {
      target: { value: weekendId },
    })
    fireEvent.click(within(mondayRow).getByRole('button', { name: 'Assigner' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Annuler' }))

    const plannedDays = await db.plannedDays.toArray()
    expect(plannedDays).toHaveLength(1)
    expect(plannedDays[0].dayTemplateId).toBe(teletravailId)
  })

  it('duplicates the current week onto the next week', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId })
    await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-08', dayTemplateId })

    render(<PlanningView />)

    const mondayRow = (await screen.findByText(/lundi 06\/07/i)).closest('[data-planning-row]')
    await within(mondayRow).findByText('Actuellement : Télétravail')
    fireEvent.click(screen.getByRole('button', { name: 'Dupliquer sur la semaine suivante' }))

    await waitFor(async () => {
      const plannedDays = await db.plannedDays.toArray()
      expect(plannedDays).toHaveLength(4)
      const nextMonday = plannedDays.find((p) => p.date === '2026-07-13')
      const nextWednesday = plannedDays.find((p) => p.date === '2026-07-15')
      expect(nextMonday).toMatchObject({ dayTemplateId })
      expect(nextWednesday).toMatchObject({ dayTemplateId })
    })
  })

  it('clears next-week days that are not planned in the current week (exact mirror)', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    // Only Monday is planned this week...
    await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId })
    // ...but next Wednesday already has a leftover assignment that doesn't exist this week.
    const staleNextWednesdayId = crypto.randomUUID()
    await db.plannedDays.add({ id: staleNextWednesdayId, date: '2026-07-15', dayTemplateId })

    render(<PlanningView />)

    const mondayRow = (await screen.findByText(/lundi 06\/07/i)).closest('[data-planning-row]')
    await within(mondayRow).findByText('Actuellement : Télétravail')
    fireEvent.click(screen.getByRole('button', { name: 'Dupliquer sur la semaine suivante' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Confirmer' }))

    await waitFor(async () => {
      const plannedDays = await db.plannedDays.toArray()
      expect(plannedDays.map((p) => p.date).sort()).toEqual(['2026-07-06', '2026-07-13'])
    })
  })

  it('asks for confirmation before duplicating over an already-planned next week', async () => {
    const dayTemplateId = crypto.randomUUID()
    const otherId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    await db.dayTemplates.add({ id: otherId, name: 'Week-end' })
    await db.plannedDays.add({ id: crypto.randomUUID(), date: '2026-07-06', dayTemplateId })
    const existingNextMondayId = crypto.randomUUID()
    await db.plannedDays.add({ id: existingNextMondayId, date: '2026-07-13', dayTemplateId: otherId })

    render(<PlanningView />)

    const mondayRow = (await screen.findByText(/lundi 06\/07/i)).closest('[data-planning-row]')
    await within(mondayRow).findByText('Actuellement : Télétravail')
    fireEvent.click(screen.getByRole('button', { name: 'Dupliquer sur la semaine suivante' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Confirmer' }))

    await waitFor(async () => {
      const nextMonday = await db.plannedDays.get(existingNextMondayId)
      expect(nextMonday).toMatchObject({ dayTemplateId })
    })
  })
})
