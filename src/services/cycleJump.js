import { UNASSIGNED_PLANNED_DAY_ID } from '../db'

// Seules les tâches "Reportables" et "Pas obligées" bénéficient de l'amnésie
// bienveillante — les "Non négociables" restent visibles sur le jour manqué,
// comme échec assumé plutôt que déplacé silencieusement.
const REPOSITIONABLE_PRIORITIES = new Set(['should', 'could'])

// Une tâche jamais triée (priority: null, cf. ProgressiveInput) peut pourtant
// être planifiée via glisser-déposer avant tout passage par TaskEnrichment.
// On la traite comme "could" (même convention que TaskEnrichment.jsx), plutôt
// que de la figer comme une tâche "must" qu'elle n'a jamais été désignée être.
function isRepositionable(priority) {
  return priority == null || REPOSITIONABLE_PRIORITIES.has(priority)
}

function sortByStartTime(a, b) {
  return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0
}

function sortByDate(a, b) {
  return a.date < b.date ? -1 : a.date > b.date ? 1 : 0
}

export async function executeCycleJump(db, currentDateISO) {
  try {
    await db.transaction('rw', db.tasks, db.plannedDays, db.timeBlocks, async () => {
      const pastPlannedDays = await db.plannedDays.where('date').below(currentDateISO).toArray()
      if (pastPlannedDays.length === 0) return

      const pastPlannedDayIds = pastPlannedDays.map((plannedDay) => plannedDay.id)
      const candidateTasks = (
        await db.tasks.where('plannedDayId').anyOf(pastPlannedDayIds).toArray()
      ).filter((task) => task.status !== 'completed' && isRepositionable(task.priority))
      if (candidateTasks.length === 0) return

      const futurePlannedDays = (
        await db.plannedDays.where('date').aboveOrEqual(currentDateISO).toArray()
      ).sort(sortByDate)

      const timeBlocksByDayTemplateId = (await db.timeBlocks.toArray()).reduce((acc, block) => {
        if (!acc[block.dayTemplateId]) acc[block.dayTemplateId] = []
        acc[block.dayTemplateId].push(block)
        return acc
      }, {})
      for (const blocks of Object.values(timeBlocksByDayTemplateId)) {
        blocks.sort(sortByStartTime)
      }

      for (const task of candidateTasks) {
        let nextPlannedDayId = UNASSIGNED_PLANNED_DAY_ID
        let nextTimeBlockId = null

        for (const plannedDay of futurePlannedDays) {
          const matchingBlock = (timeBlocksByDayTemplateId[plannedDay.dayTemplateId] ?? []).find(
            (block) => block.categoryId === task.categoryId,
          )
          if (matchingBlock) {
            nextPlannedDayId = plannedDay.id
            nextTimeBlockId = matchingBlock.id
            break
          }
        }

        await db.tasks.update(task.id, { plannedDayId: nextPlannedDayId, timeBlockId: nextTimeBlockId })
      }
    })
  } catch (err) {
    console.error(err)
  }
}
