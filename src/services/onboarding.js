import { db } from '../db'

const STANDARD_CATEGORIES = [
  { name: 'Travail', color: '#BFDBFE' },
  { name: 'Personnel', color: '#FDE68A' },
  { name: 'Pause', color: '#D1FAE5' },
]

const STANDARD_TIME_BLOCKS = [
  { startTime: '09:00', endTime: '12:00', categoryIndex: 0 },
  { startTime: '12:00', endTime: '13:00', categoryIndex: 2 },
  { startTime: '13:00', endTime: '18:00', categoryIndex: 0 },
  { startTime: '18:00', endTime: '20:00', categoryIndex: 1 },
]

const ISO_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function toISODate(date) {
  return ISO_DATE_FORMATTER.format(date)
}

// crypto.randomUUID() throws outside secure contexts (e.g. plain HTTP); fall back to a manual UUIDv4.
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID()
    } catch {
      // fall through to manual generation
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export async function ensureOnboarding() {
  try {
    await db.transaction(
      'rw',
      db.categories,
      db.dayTemplates,
      db.timeBlocks,
      db.plannedDays,
      async () => {
        const [categoryCount, dayTemplateCount] = await Promise.all([
          db.categories.count(),
          db.dayTemplates.count(),
        ])

        // The two checks are independent on purpose: a user may have created a category
        // (e.g. via Configuration) before ever opening "Aujourd'hui", which must not skip
        // generating the standard day template — and vice versa.
        let categoryIdsByBlockIndex
        if (categoryCount === 0) {
          const newCategoryIds = STANDARD_CATEGORIES.map(() => generateId())
          await db.categories.bulkAdd(
            STANDARD_CATEGORIES.map((category, index) => ({ id: newCategoryIds[index], ...category })),
          )
          categoryIdsByBlockIndex = STANDARD_TIME_BLOCKS.map((block) => newCategoryIds[block.categoryIndex])
        } else {
          // Existing categories weren't created for these standard blocks, so there's no
          // meaningful mapping between them — fall back to a single one rather than cycling
          // through them arbitrarily.
          const [firstExistingCategory] = await db.categories.toArray()
          categoryIdsByBlockIndex = STANDARD_TIME_BLOCKS.map(() => firstExistingCategory.id)
        }

        if (dayTemplateCount > 0) return

        const dayTemplateId = generateId()
        await db.dayTemplates.add({ id: dayTemplateId, name: 'Journée Standard' })

        await db.timeBlocks.bulkAdd(
          STANDARD_TIME_BLOCKS.map((block, index) => ({
            id: generateId(),
            dayTemplateId,
            categoryId: categoryIdsByBlockIndex[index],
            startTime: block.startTime,
            endTime: block.endTime,
          })),
        )

        const todayISO = toISODate(new Date())
        const existingPlannedDay = await db.plannedDays.where('date').equals(todayISO).first()
        if (!existingPlannedDay) {
          await db.plannedDays.add({ id: generateId(), date: todayISO, dayTemplateId })
        }
      },
    )
  } catch (err) {
    console.error(err)
  }
}
