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
  const [newChecklistText, setNewChecklistText] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const categories = useLiveQuery(() => db.categories.toArray(), [], [])

  const selectedPriority = task.priority ?? 'could'

  const setPriority = (value) => {
    db.tasks.update(task.id, { priority: value }).catch((err) => {
      console.error(err)
      setErrorMsg("Impossible de mettre à jour la priorité.")
    })
  }

  const assignCategory = (categoryId) => {
    db.tasks.update(task.id, { categoryId }).catch((err) => {
      console.error(err)
      setErrorMsg("Impossible d'assigner la catégorie.")
    })
  }

  const createAndAssignCategory = async (event) => {
    event.preventDefault()
    const name = newCategoryName.trim()
    if (!name) {
      setErrorMsg('')
      return
    }

    setErrorMsg('')
    try {
      await db.transaction('rw', db.categories, db.tasks, async () => {
        let categoryId
        const existing = await db.categories.where('name').equalsIgnoreCase(name).first()
        if (existing) {
          categoryId = existing.id
        } else {
          categoryId = crypto.randomUUID()
          let hash = 0
          for (let i = 0; i < name.length; i++) {
            hash = (hash << 5) - hash + name.charCodeAt(i)
            hash |= 0
          }
          const color = PASTEL_PALETTE[Math.abs(hash) % PASTEL_PALETTE.length]
          await db.categories.add({ id: categoryId, name, color })
        }
        await db.tasks.update(task.id, { categoryId })
      })
      setNewCategoryName('')
    } catch (err) {
      console.error(err)
      setErrorMsg("Erreur lors de la création de la catégorie.")
    }
  }

  const addChecklistItem = async (event) => {
    event.preventDefault()
    const text = newChecklistText.trim()
    if (!text) {
      setErrorMsg('')
      return
    }

    setErrorMsg('')
    const newItem = { id: crypto.randomUUID(), text, isCompleted: false }

    try {
      await db.transaction('rw', db.tasks, async () => {
        const currentTask = await db.tasks.get(task.id)
        if (!currentTask) throw new Error("Tâche introuvable")
        const updatedChecklist = [...(currentTask.checklist ?? []), newItem]
        await db.tasks.update(task.id, { checklist: updatedChecklist })
      })
      setNewChecklistText('')
    } catch (err) {
      console.error(err)
      setErrorMsg("Impossible d'ajouter cet élément à la checklist.")
    }
  }

  return (
    <div className="task-enrichment">
      {errorMsg && <div className="task-enrichment__error" role="alert">{errorMsg}</div>}
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
        <label htmlFor="new-category-input" className="task-enrichment__label">Catégorie</label>
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
        <form 
          className="task-enrichment__form" 
          aria-label="Ajouter une catégorie" 
          onSubmit={createAndAssignCategory}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          <input
            id="new-category-input"
            type="text"
            className="task-enrichment__new-category"
            placeholder="Nouvelle catégorie…"
            value={newCategoryName}
            maxLength={50}
            onChange={(event) => setNewCategoryName(event.target.value)}
          />
          <button type="submit" className="task-enrichment__submit">Ajouter</button>
        </form>
      </div>

      <div className="task-enrichment__section">
        <label htmlFor="new-checklist-input" className="task-enrichment__label">Checklist</label>
        <form
          className="task-enrichment__form"
          aria-label="Ajouter un élément à la checklist"
          onSubmit={addChecklistItem}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          <input
            id="new-checklist-input"
            type="text"
            className="task-enrichment__checklist-input"
            placeholder="Ajouter un prérequis…"
            value={newChecklistText}
            maxLength={200}
            onChange={(event) => setNewChecklistText(event.target.value)}
          />
          <button type="submit" className="task-enrichment__submit">Ajouter</button>
        </form>
      </div>
    </div>
  )
}
