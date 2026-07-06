import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'
import { db } from './db'
import * as cycleJump from './services/cycleJump'

function setVisibilityState(state) {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('App', () => {
  beforeEach(() => {
    // Force a real hash transition so a fresh '' entry is always pushed
    // immediately before each test, regardless of history state left by
    // previous tests in this file.
    window.location.hash = '#/__test-reset__'
    window.location.hash = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

  it('navigates to Semaine and updates the hash', async () => {
    render(<App />)

    screen.getByRole('button', { name: 'Semaine' }).click()

    expect(await screen.findByRole('heading', { name: 'Semaine' })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/semaine')
  })

  it('shows a not-found view for an unrecognized hash instead of silently defaulting', () => {
    window.location.hash = '#/route-inconnue'

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Page introuvable' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: "Aujourd'hui" })).not.toBeInTheDocument()
  })

  it('shows a recovery screen with a reset action when the database fails to open', async () => {
    vi.spyOn(db, 'open').mockRejectedValueOnce(new Error('simulated upgrade failure'))

    render(<App />)

    expect(
      await screen.findByRole('heading', { name: /vos données n'ont pas pu être ouvertes/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /réinitialiser les données/i }),
    ).toBeInTheDocument()
    // The normal navigation must NOT render on top of the fatal-error screen.
    expect(screen.queryByRole('navigation', { name: 'Navigation principale' })).not.toBeInTheDocument()
  })

  it('rejoue le saut de cycle quand la date change et que l’onglet redevient visible', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-06T10:00:00'))
    const executeCycleJumpSpy = vi.spyOn(cycleJump, 'executeCycleJump').mockResolvedValue(undefined)

    render(<App />)
    await vi.waitFor(() => expect(executeCycleJumpSpy).toHaveBeenCalledTimes(1))
    expect(executeCycleJumpSpy).toHaveBeenLastCalledWith(db, '2026-07-06')

    // Onglet caché puis ré-affiché le même jour : pas de nouveau passage.
    setVisibilityState('hidden')
    setVisibilityState('visible')
    expect(executeCycleJumpSpy).toHaveBeenCalledTimes(1)

    // La date système bascule au lendemain pendant que l'app reste ouverte.
    vi.setSystemTime(new Date('2026-07-07T00:05:00'))
    setVisibilityState('hidden')
    setVisibilityState('visible')

    expect(executeCycleJumpSpy).toHaveBeenCalledTimes(2)
    expect(executeCycleJumpSpy).toHaveBeenLastCalledWith(db, '2026-07-07')

    vi.useRealTimers()
  })

  it('rejoue le saut de cycle via le filet de sécurité périodique même si l’onglet ne perd jamais le focus', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-06T10:00:00'))
    const executeCycleJumpSpy = vi.spyOn(cycleJump, 'executeCycleJump').mockResolvedValue(undefined)

    render(<App />)
    await vi.waitFor(() => expect(executeCycleJumpSpy).toHaveBeenCalledTimes(1))

    // La date système bascule au lendemain sans que l'onglet ne change jamais
    // de visibilité (poste kiosque) : seul le filet de sécurité périodique
    // peut détecter le changement de jour.
    vi.setSystemTime(new Date('2026-07-07T00:05:00'))
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)

    expect(executeCycleJumpSpy).toHaveBeenCalledTimes(2)
    expect(executeCycleJumpSpy).toHaveBeenLastCalledWith(db, '2026-07-07')

    vi.useRealTimers()
  })
})
