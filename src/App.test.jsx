import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    // Force a real hash transition so a fresh '' entry is always pushed
    // immediately before each test, regardless of history state left by
    // previous tests in this file.
    window.location.hash = '#/__test-reset__'
    window.location.hash = ''
  })

  it("shows the Aujourd'hui view by default", () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: "Aujourd'hui" })).toBeInTheDocument()
  })

  it('navigates to Dépôt and updates the hash', async () => {
    render(<App />)

    screen.getByRole('button', { name: 'Dépôt' }).click()

    expect(await screen.findByRole('heading', { name: 'Dépôt' })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/depot')
  })

  it('navigates to Configuration and updates the hash', async () => {
    render(<App />)

    screen.getByRole('button', { name: 'Configuration' }).click()

    expect(await screen.findByRole('heading', { name: 'Configuration' })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/configuration')
  })

  it("restores the Aujourd'hui view when the browser goes back", async () => {
    render(<App />)

    screen.getByRole('button', { name: 'Configuration' }).click()
    await screen.findByRole('heading', { name: 'Configuration' })

    window.history.back()

    expect(await screen.findByRole('heading', { name: "Aujourd'hui" })).toBeInTheDocument()
  })

  it('navigates to Planification and updates the hash', async () => {
    render(<App />)

    screen.getByRole('button', { name: 'Planification' }).click()

    expect(await screen.findByRole('heading', { name: 'Planification' })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/planification')
  })

  it('shows a not-found view for an unrecognized hash instead of silently defaulting', () => {
    window.location.hash = '#/route-inconnue'

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Page introuvable' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: "Aujourd'hui" })).not.toBeInTheDocument()
  })
})
