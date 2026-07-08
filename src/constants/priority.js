// Constantes métier de priorité, partagées entre TaskEnrichment, TaskCard et le
// moteur de suggestion (Story 4.2) pour garantir un tri cohérent partout.

export const PRIORITY_OPTIONS = [
  { value: 'must', label: 'Non négociable' },
  { value: 'should', label: 'Reportable' },
  { value: 'could', label: 'Vraiment pas obligé' },
]

// Ordre de priorité décroissant (0 = plus prioritaire) utilisé pour le tri.
const PRIORITY_RANK = { must: 0, should: 1, could: 2 }
const DEFAULT_PRIORITY = 'could'

export function getPriorityRank(priority) {
  return PRIORITY_RANK[priority] ?? PRIORITY_RANK[DEFAULT_PRIORITY]
}
