import { useRef, useState } from 'react'
import { db } from '../db'
import './ProgressiveInput.css'

export function ProgressiveInput() {
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter') return

    const title = value.trim()
    if (!title) return

    let id
    try {
      id = crypto.randomUUID()
    } catch {
      setError("La tâche n'a pas pu être enregistrée. Réessayez.")
      return
    }

    setError(null)
    setValue('')
    inputRef.current?.focus()

    db.tasks
      .add({
        id,
        title,
        status: 'inbox',
        createdAt: new Date().toISOString(),
        category: null,
        priority: null,
        categoryId: null,
        plannedDayId: null,
        checklist: [],
      })
      .catch(() => {
        setValue((current) => current || title)
        setError("La tâche n'a pas pu être enregistrée. Réessayez.")
        inputRef.current?.focus()
      })
  }

  return (
    <div className="progressive-input">
      <input
        ref={inputRef}
        type="text"
        className="progressive-input__field"
        placeholder="Qu'avez-vous en tête ?"
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          setError(null)
        }}
        onKeyDown={handleKeyDown}
        autoFocus
        aria-label="Nouvelle tâche"
      />
      {error && (
        <p className="progressive-input__hint" role="status">
          {error}
        </p>
      )}
    </div>
  )
}
