import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProgressiveInput } from './ProgressiveInput'
import { db } from '../db'

describe('ProgressiveInput', () => {
  beforeEach(async () => {
    await db.tasks.clear()
  })

  it('saves the task to Dexie on Enter and clears the field, keeping focus', async () => {
    render(<ProgressiveInput />)
    const input = screen.getByLabelText('Nouvelle tâche')

    fireEvent.change(input, { target: { value: 'Appeler le dentiste' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(async () => {
      const tasks = await db.tasks.toArray()
      expect(tasks).toHaveLength(1)
      expect(tasks[0]).toMatchObject({
        title: 'Appeler le dentiste',
        status: 'inbox',
      })
    })

    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
  })

  it('does not save an empty or whitespace-only task', async () => {
    render(<ProgressiveInput />)
    const input = screen.getByLabelText('Nouvelle tâche')

    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    const tasks = await db.tasks.toArray()
    expect(tasks).toHaveLength(0)
  })
})
