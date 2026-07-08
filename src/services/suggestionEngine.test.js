import { describe, it, expect } from 'vitest'
import { suggestTasksForBlock, isTaskReady } from './suggestionEngine'

const CATEGORY_A = 'category-a'
const CATEGORY_B = 'category-b'

function makeTask(overrides) {
  return {
    id: crypto.randomUUID(),
    title: 'Tâche',
    status: 'inbox',
    createdAt: '2026-07-01T10:00:00.000Z',
    categoryId: CATEGORY_A,
    priority: 'could',
    plannedDayId: '',
    timeBlockId: null,
    checklist: [],
    ...overrides,
  }
}

const block = { id: 'block-1', categoryId: CATEGORY_A, startTime: '09:00', endTime: '10:00' }

describe('suggestTasksForBlock', () => {
  it('filtre par la catégorie de la plage', () => {
    const matching = makeTask({ title: 'Bonne catégorie' })
    const other = makeTask({ title: 'Autre catégorie', categoryId: CATEGORY_B })

    const result = suggestTasksForBlock([matching, other], block)

    expect(result).toEqual([matching])
  })

  it('trie par priorité décroissante : must > should > could', () => {
    const could = makeTask({ title: 'Could', priority: 'could' })
    const must = makeTask({ title: 'Must', priority: 'must' })
    const should = makeTask({ title: 'Should', priority: 'should' })

    const result = suggestTasksForBlock([could, must, should], block)

    expect(result.map((task) => task.title)).toEqual(['Must', 'Should', 'Could'])
  })

  it('à priorité égale, priorise les tâches prêtes (checklist complète ou absente)', () => {
    const notReady = makeTask({
      title: 'Pas prête',
      checklist: [{ id: '1', text: 'Item', isCompleted: false }],
    })
    const ready = makeTask({
      title: 'Prête',
      checklist: [{ id: '2', text: 'Item', isCompleted: true }],
    })

    const result = suggestTasksForBlock([notReady, ready], block)

    expect(result.map((task) => task.title)).toEqual(['Prête', 'Pas prête'])
  })

  it('à priorité et préparation égales, priorise les tâches les plus anciennes', () => {
    const recent = makeTask({ title: 'Récente', createdAt: '2026-07-05T10:00:00.000Z' })
    const old = makeTask({ title: 'Ancienne', createdAt: '2026-07-01T10:00:00.000Z' })

    const result = suggestTasksForBlock([recent, old], block)

    expect(result.map((task) => task.title)).toEqual(['Ancienne', 'Récente'])
  })

  it('exclut les tâches déjà affectées à un autre bloc', () => {
    const assigned = makeTask({ title: 'Affectée', timeBlockId: 'other-block' })
    const unassigned = makeTask({ title: 'Non affectée' })

    const result = suggestTasksForBlock([assigned, unassigned], block)

    expect(result).toEqual([unassigned])
  })

  it('exclut les tâches terminées', () => {
    const completed = makeTask({ title: 'Terminée', status: 'completed' })
    const pending = makeTask({ title: 'En attente' })

    const result = suggestTasksForBlock([completed, pending], block)

    expect(result).toEqual([pending])
  })

  it("ne filtre pas par catégorie si le bloc n'en a pas", () => {
    const withCategory = makeTask({ title: 'Avec catégorie', categoryId: CATEGORY_A })
    const withoutCategory = makeTask({ title: 'Sans catégorie', categoryId: undefined })
    const blockWithoutCategory = { id: 'block-2', categoryId: null, startTime: '09:00', endTime: '10:00' }

    const result = suggestTasksForBlock([withCategory, withoutCategory], blockWithoutCategory)

    expect(result).toHaveLength(2)
  })

  it('retourne un tableau vide sans bloc', () => {
    expect(suggestTasksForBlock([makeTask({})], null)).toEqual([])
  })
})

describe('isTaskReady', () => {
  it('est prête sans checklist', () => {
    expect(isTaskReady(makeTask({ checklist: [] }))).toBe(true)
  })

  it("n'est pas prête si un item de checklist reste incomplet", () => {
    expect(
      isTaskReady(makeTask({ checklist: [{ id: '1', text: 'x', isCompleted: false }] })),
    ).toBe(false)
  })

  it('est prête si tous les items de checklist sont complétés', () => {
    expect(
      isTaskReady(makeTask({ checklist: [{ id: '1', text: 'x', isCompleted: true }] })),
    ).toBe(true)
  })
})
