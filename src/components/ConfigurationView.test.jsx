import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConfigurationView } from './ConfigurationView'
import { db } from '../db'

describe('ConfigurationView', () => {
  beforeEach(async () => {
    await db.dayTemplates.clear()
    await db.timeBlocks.clear()
    await db.categories.clear()
  })

  it('creates a new day template and selects it', async () => {
    render(<ConfigurationView />)

    const input = screen.getByLabelText('Nom de la journée type')
    fireEvent.change(input, { target: { value: 'Télétravail' } })
    fireEvent.submit(input.closest('form'))

    await waitFor(async () => {
      const templates = await db.dayTemplates.toArray()
      expect(templates).toHaveLength(1)
      expect(templates[0]).toMatchObject({ name: 'Télétravail' })
    })

    expect(input).toHaveValue('')
    expect(await screen.findByRole('option', { name: 'Télétravail', selected: true })).toBeInTheDocument()
  })

  it('does not create a day template with an empty name', async () => {
    render(<ConfigurationView />)

    const input = screen.getByLabelText('Nom de la journée type')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(input.closest('form'))

    const templates = await db.dayTemplates.toArray()
    expect(templates).toHaveLength(0)
  })

  it('adds a valid time block to the selected day template', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    const categoryId = crypto.randomUUID()
    await db.categories.add({ id: categoryId, name: 'Travail', color: '#BFDBFE' })

    render(<ConfigurationView />)

    fireEvent.click(await screen.findByRole('option', { name: 'Télétravail' }))

    fireEvent.change(screen.getByLabelText('Début'), { target: { value: '09:00' } })
    fireEvent.change(screen.getByLabelText('Fin'), { target: { value: '12:00' } })
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: categoryId } })
    fireEvent.submit(screen.getByLabelText('Catégorie').closest('form'))

    await waitFor(async () => {
      const blocks = await db.timeBlocks.toArray()
      expect(blocks).toHaveLength(1)
      expect(blocks[0]).toMatchObject({
        dayTemplateId,
        categoryId,
        startTime: '09:00',
        endTime: '12:00',
      })
    })

    expect(await screen.findByText('09:00 – 12:00')).toBeInTheDocument()
    expect(screen.getByText('Travail', { selector: '.configuration-view__block-category' })).toBeInTheDocument()
  })

  it('rejects a time block whose start and end time are identical', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    const categoryId = crypto.randomUUID()
    await db.categories.add({ id: categoryId, name: 'Travail', color: '#BFDBFE' })

    render(<ConfigurationView />)

    fireEvent.click(await screen.findByRole('option', { name: 'Télétravail' }))

    fireEvent.change(screen.getByLabelText('Début'), { target: { value: '09:00' } })
    fireEvent.change(screen.getByLabelText('Fin'), { target: { value: '09:00' } })
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: categoryId } })
    fireEvent.submit(screen.getByLabelText('Catégorie').closest('form'))

    expect(
      await screen.findByText("L'heure de début et l'heure de fin ne peuvent pas être identiques."),
    ).toBeInTheDocument()
    const blocks = await db.timeBlocks.toArray()
    expect(blocks).toHaveLength(0)
  })

  it('accepts a time block that crosses midnight', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    const categoryId = crypto.randomUUID()
    await db.categories.add({ id: categoryId, name: 'Travail', color: '#BFDBFE' })

    render(<ConfigurationView />)

    fireEvent.click(await screen.findByRole('option', { name: 'Télétravail' }))

    fireEvent.change(screen.getByLabelText('Début'), { target: { value: '22:00' } })
    fireEvent.change(screen.getByLabelText('Fin'), { target: { value: '01:00' } })
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: categoryId } })
    fireEvent.submit(screen.getByLabelText('Catégorie').closest('form'))

    await waitFor(async () => {
      const blocks = await db.timeBlocks.toArray()
      expect(blocks).toHaveLength(1)
      expect(blocks[0]).toMatchObject({ startTime: '22:00', endTime: '01:00' })
    })
    expect(await screen.findByText('22:00 – 01:00')).toBeInTheDocument()
  })

  it('rejects an overnight time block that overlaps an existing morning block', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    const categoryId = crypto.randomUUID()
    await db.categories.add({ id: categoryId, name: 'Travail', color: '#BFDBFE' })
    await db.timeBlocks.add({
      id: crypto.randomUUID(),
      dayTemplateId,
      categoryId,
      startTime: '09:00',
      endTime: '12:00',
    })

    render(<ConfigurationView />)

    fireEvent.click(await screen.findByRole('option', { name: 'Télétravail' }))
    await screen.findByText('09:00 – 12:00')

    fireEvent.change(screen.getByLabelText('Début'), { target: { value: '23:00' } })
    fireEvent.change(screen.getByLabelText('Fin'), { target: { value: '10:00' } })
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: categoryId } })
    fireEvent.submit(screen.getByLabelText('Catégorie').closest('form'))

    expect(
      await screen.findByText('Cette plage horaire chevauche une plage existante.'),
    ).toBeInTheDocument()
    const blocks = await db.timeBlocks.toArray()
    expect(blocks).toHaveLength(1)
  })

  it('rejects a time block that overlaps an existing one', async () => {
    const dayTemplateId = crypto.randomUUID()
    await db.dayTemplates.add({ id: dayTemplateId, name: 'Télétravail' })
    const categoryId = crypto.randomUUID()
    await db.categories.add({ id: categoryId, name: 'Travail', color: '#BFDBFE' })
    await db.timeBlocks.add({
      id: crypto.randomUUID(),
      dayTemplateId,
      categoryId,
      startTime: '09:00',
      endTime: '12:00',
    })

    render(<ConfigurationView />)

    fireEvent.click(await screen.findByRole('option', { name: 'Télétravail' }))
    await screen.findByText('09:00 – 12:00')

    fireEvent.change(screen.getByLabelText('Début'), { target: { value: '11:00' } })
    fireEvent.change(screen.getByLabelText('Fin'), { target: { value: '13:00' } })
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: categoryId } })
    fireEvent.submit(screen.getByLabelText('Catégorie').closest('form'))

    expect(
      await screen.findByText('Cette plage horaire chevauche une plage existante.'),
    ).toBeInTheDocument()
    const blocks = await db.timeBlocks.toArray()
    expect(blocks).toHaveLength(1)
  })
})
