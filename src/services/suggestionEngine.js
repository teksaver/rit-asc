// Moteur de suggestion (Story 4.2) : sélectionne et trie les tâches du dépôt les
// plus adaptées à une plage horaire donnée. Fonction pure, aucune dépendance à
// Dexie/React — la lecture des tâches "inbox" reste à la charge de l'appelant
// (voir TodayView, qui utilise déjà la requête composite [status+plannedDayId]).

import { getPriorityRank } from '../constants/priority'

export function isTaskReady(task) {
  return !task.checklist || task.checklist.length === 0 || task.checklist.every((item) => item.isCompleted)
}

export function suggestTasksForBlock(tasks, block) {
  if (!block) return []

  return tasks
    .filter((task) => task.status !== 'completed' && !task.timeBlockId)
    .filter((task) => !block.categoryId || task.categoryId === block.categoryId)
    .sort((a, b) => {
      const priorityDiff = getPriorityRank(a.priority) - getPriorityRank(b.priority)
      if (priorityDiff !== 0) return priorityDiff

      const readinessDiff = Number(isTaskReady(b)) - Number(isTaskReady(a))
      if (readinessDiff !== 0) return readinessDiff

      const aCreatedAt = a.createdAt ?? ''
      const bCreatedAt = b.createdAt ?? ''
      return aCreatedAt < bCreatedAt ? -1 : aCreatedAt > bCreatedAt ? 1 : 0
    })
}
