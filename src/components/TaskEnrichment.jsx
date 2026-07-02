import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import './TaskEnrichment.css'

const PASTEL_PALETTE = ['#FDE68A', '#BFDBFE', '#FBCFE8', '#C7D2FE', '#BBF7D0', '#FED7AA']

export const PRIORITY_OPTIONS = [
  { value: 'must', label: 'Non négociable' },
  { value: 'should', label: 'Reportable' },
  { value: 'could', label: 'Vraiment pas obligé' },
]

export function TaskEnrichment({ task }) {
  const [newCategoryName, setNewCategoryName] = useState('')
  const categories = useLiveQuery(() => db.categories.toArray(), [], [])

  const selectedPriority = task.priority ?? 'could'

  const setPriority = (value) => {
    db.tasks.update(task.id, { priority: value }).catch(() => {})
  }

  const assignCategory = (categoryId) => {
    db.tasks.update(task.id, { categoryId }).catch(() => {})
  }

  const createAndAssignCategory = async (rawName) => {
    const name = rawName.trim()
    if (!name) return

    const existing = categories.find(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    )

    if (existing) {
      assignCategory(existing.id)
      return
    }

    const id = crypto.randomUUID()
    const color = PASTEL_PALETTE[categories.length % PASTEL_PALETTE.length]

    try {
      await db.categories.add({ id, name, color })
      assignCategory(id)
    } catch {
      // Création silencieusement ignorée en cas d'échec Dexie ; l'utilisateur peut réessayer.
    }
  }

  const handleNewCategoryKeyDown = (event) => {
    if (event.key !== 'Enter') return
    createAndAssignCategory(newCategoryName)
    setNewCategoryName('')
  }

  return (
    <div className="task-enrichment">
      <div className="task-enrichment__section">
        <p className="task-enrichment__label">Priorité</p>
        <div className="task-enrichment__pills" role="group" aria-label="Priorité de la tâche">
          {PRIORITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`task-enrichment__pill${
                selectedPriority === option.value ? ' task-enrichment__pill--selected' : ''
              }`}
              aria-pressed={selectedPriority === option.value}
              onClick={() => setPriority(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="task-enrichment__section">
        <p className="task-enrichment__label">Catégorie</p>
        <div className="task-enrichment__pills" role="group" aria-label="Catégories existantes">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`task-enrichment__pill${
                task.categoryId === category.id ? ' task-enrichment__pill--selected' : ''
              }`}
              style={{ backgroundColor: category.color }}
              aria-pressed={task.categoryId === category.id}
              onClick={() => assignCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="task-enrichment__new-category"
          placeholder="Nouvelle catégorie…"
          value={newCategoryName}
          onChange={(event) => setNewCategoryName(event.target.value)}
          onKeyDown={handleNewCategoryKeyDown}
          aria-label="Créer une nouvelle catégorie"
        />
      </div>
    </div>
  )
}
