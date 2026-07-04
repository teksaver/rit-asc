import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import './ConfigurationView.css'

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// A block whose end <= start crosses midnight (e.g. 22:00-01:00); split it
// into its same-day segments so overlap checks stay correct across the wrap.
function toDaySegments(start, end) {
  return start < end ? [[start, end]] : [[start, 1440], [0, end]]
}

function segmentsOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA
}

function blocksOverlap(startA, endA, startB, endB) {
  const segmentsA = toDaySegments(startA, endA)
  const segmentsB = toDaySegments(startB, endB)
  return segmentsA.some(([sA, eA]) =>
    segmentsB.some(([sB, eB]) => segmentsOverlap(sA, eA, sB, eB)),
  )
}

export function ConfigurationView() {
  const [newDayTemplateName, setNewDayTemplateName] = useState('')
  const [selectedDayTemplateId, setSelectedDayTemplateId] = useState(null)
  const [newBlockStart, setNewBlockStart] = useState('')
  const [newBlockEnd, setNewBlockEnd] = useState('')
  const [newBlockCategoryId, setNewBlockCategoryId] = useState('')
  const [templateErrorMsg, setTemplateErrorMsg] = useState('')
  const [blockErrorMsg, setBlockErrorMsg] = useState('')
  const [isSubmittingTemplate, setIsSubmittingTemplate] = useState(false)
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false)

  const dayTemplates = useLiveQuery(() => db.dayTemplates.toArray(), [], [])
  const categories = useLiveQuery(() => db.categories.toArray(), [], [])
  const timeBlocks = useLiveQuery(
    () =>
      selectedDayTemplateId
        ? db.timeBlocks.where('dayTemplateId').equals(selectedDayTemplateId).toArray()
        : Promise.resolve([]),
    [selectedDayTemplateId],
    [],
  )

  const categoriesMap = categories.reduce((acc, category) => {
    acc[category.id] = category
    return acc
  }, {})

  const selectedDayTemplate = dayTemplates.find((template) => template.id === selectedDayTemplateId)
  const sortedTimeBlocks = [...timeBlocks].sort((a, b) =>
    a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0,
  )

  const selectDayTemplate = (id) => {
    setSelectedDayTemplateId(id)
    setNewBlockStart('')
    setNewBlockEnd('')
    setNewBlockCategoryId('')
    setBlockErrorMsg('')
  }

  const createDayTemplate = async (event) => {
    event.preventDefault()
    if (isSubmittingTemplate) return
    const name = newDayTemplateName.trim()
    if (!name) {
      setTemplateErrorMsg('Le nom de la journée type est requis.')
      return
    }

    setIsSubmittingTemplate(true)
    setTemplateErrorMsg('')
    try {
      const id = crypto.randomUUID()
      await db.dayTemplates.add({ id, name })
      setNewDayTemplateName('')
      selectDayTemplate(id)
    } catch (err) {
      console.error(err)
      setTemplateErrorMsg('Impossible de créer ce modèle de journée.')
    } finally {
      setIsSubmittingTemplate(false)
    }
  }

  const addTimeBlock = async (event) => {
    event.preventDefault()
    if (isSubmittingBlock || !selectedDayTemplateId) return

    if (!newBlockStart || !newBlockEnd || !newBlockCategoryId) {
      setBlockErrorMsg('Renseignez une heure de début, une heure de fin et une catégorie.')
      return
    }

    const startMinutes = toMinutes(newBlockStart)
    const endMinutes = toMinutes(newBlockEnd)

    if (startMinutes === endMinutes) {
      setBlockErrorMsg("L'heure de début et l'heure de fin ne peuvent pas être identiques.")
      return
    }

    const hasOverlap = timeBlocks.some((block) =>
      blocksOverlap(startMinutes, endMinutes, toMinutes(block.startTime), toMinutes(block.endTime)),
    )
    if (hasOverlap) {
      setBlockErrorMsg('Cette plage horaire chevauche une plage existante.')
      return
    }

    setIsSubmittingBlock(true)
    setBlockErrorMsg('')
    try {
      await db.timeBlocks.add({
        id: crypto.randomUUID(),
        dayTemplateId: selectedDayTemplateId,
        categoryId: newBlockCategoryId,
        startTime: newBlockStart,
        endTime: newBlockEnd,
      })
      setNewBlockStart('')
      setNewBlockEnd('')
    } catch (err) {
      console.error(err)
      setBlockErrorMsg("Impossible d'ajouter cette plage horaire.")
    } finally {
      setIsSubmittingBlock(false)
    }
  }

  return (
    <div className="configuration-view">
      <section className="configuration-view__section">
        <h2 className="configuration-view__heading">Journées types</h2>
        {templateErrorMsg && (
          <div className="configuration-view__error" role="alert">
            {templateErrorMsg}
          </div>
        )}

        {dayTemplates.length === 0 && (
          <p className="configuration-view__empty">Aucune journée type pour le moment.</p>
        )}

        <ul className="configuration-view__templates" role="listbox" aria-label="Journées types">
          {dayTemplates.map((template) => (
            <li key={template.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={template.id === selectedDayTemplateId}
                className={cx(
                  'configuration-view__template',
                  template.id === selectedDayTemplateId && 'configuration-view__template--selected',
                )}
                onClick={() => selectDayTemplate(template.id)}
              >
                {template.name}
              </button>
            </li>
          ))}
        </ul>

        <form
          className="configuration-view__form"
          aria-label="Créer une journée type"
          onSubmit={createDayTemplate}
        >
          <input
            type="text"
            className="configuration-view__input"
            placeholder="Nouvelle journée type…"
            aria-label="Nom de la journée type"
            value={newDayTemplateName}
            maxLength={50}
            onChange={(event) => setNewDayTemplateName(event.target.value)}
          />
          <button type="submit" className="configuration-view__submit" disabled={isSubmittingTemplate}>
            Créer
          </button>
        </form>
      </section>

      {selectedDayTemplate && (
        <section className="configuration-view__section">
          <h3 className="configuration-view__heading">Plages horaires — {selectedDayTemplate.name}</h3>

          {sortedTimeBlocks.length === 0 && (
            <p className="configuration-view__empty">Aucune plage horaire pour le moment.</p>
          )}

          <ul className="configuration-view__blocks">
            {sortedTimeBlocks.map((block) => {
              const category = categoriesMap[block.categoryId]
              return (
                <li
                  key={block.id}
                  className="configuration-view__block"
                  style={{ backgroundColor: category?.color ?? 'var(--color-muted)' }}
                >
                  <span className="configuration-view__block-time">
                    {block.startTime} – {block.endTime}
                  </span>
                  <span className="configuration-view__block-category">
                    {category?.name ?? 'Sans catégorie'}
                  </span>
                </li>
              )
            })}
          </ul>

          {blockErrorMsg && (
            <div className="configuration-view__error" role="alert">
              {blockErrorMsg}
            </div>
          )}

          <form
            className="configuration-view__form configuration-view__form--block"
            aria-label="Ajouter une plage horaire"
            onSubmit={addTimeBlock}
          >
            <label className="configuration-view__field">
              Début
              <input
                type="time"
                value={newBlockStart}
                onChange={(event) => setNewBlockStart(event.target.value)}
              />
            </label>
            <label className="configuration-view__field">
              Fin
              <input
                type="time"
                value={newBlockEnd}
                onChange={(event) => setNewBlockEnd(event.target.value)}
              />
            </label>
            <label className="configuration-view__field">
              Catégorie
              <select
                value={newBlockCategoryId}
                onChange={(event) => setNewBlockCategoryId(event.target.value)}
              >
                <option value="">Choisir…</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="configuration-view__submit" disabled={isSubmittingBlock}>
              Ajouter
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
