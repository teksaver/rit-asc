import { useRef, useState } from 'react'
import { db } from '../db'
import './ProgressiveInput.css'

export function ProgressiveInput() {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  const handleKeyDown = async (event) => {
    if (event.key !== 'Enter') return

    const title = value.trim()
    if (!title) return

    await db.tasks.add({
      title,
      status: 'inbox',
      createdAt: new Date().toISOString(),
      category: null,
      priority: null,
    })

    setValue('')
    inputRef.current?.focus()
  }

  return (
    <div className="progressive-input">
      <input
        ref={inputRef}
        type="text"
        className="progressive-input__field"
        placeholder="Qu'avez-vous en tête ?"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        aria-label="Nouvelle tâche"
      />
    </div>
  )
}
