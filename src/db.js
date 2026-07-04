import Dexie from 'dexie'

export const db = new Dexie('RouteInDB')

// IndexedDB keys can't be null/undefined, so the `[status+plannedDayId]` compound index
// (used to query unplanned inbox tasks without an in-memory filter) needs a real value for
// "not planned". Every write path must use this sentinel instead of null/undefined, or the
// task silently drops out of the index and disappears from the Inbox.
export const UNASSIGNED_PLANNED_DAY_ID = ''

db.version(1).stores({
  tasks: '++id, title, status, createdAt, category, priority',
})

db.version(2).stores({
  tasks: 'id, title, status, createdAt, category, priority, categoryId, plannedDayId',
})

db.version(3).stores({
  tasks: 'id, title, status, createdAt, category, priority, categoryId, plannedDayId',
  categories: 'id, name',
})

db.version(4).stores({
  tasks: 'id, title, status, createdAt, category, priority, categoryId, plannedDayId',
  categories: 'id, name',
  dayTemplates: 'id, name',
  timeBlocks: 'id, dayTemplateId, categoryId, startTime, endTime',
})

db.version(5).stores({
  tasks: 'id, title, status, createdAt, category, priority, categoryId, plannedDayId',
  categories: 'id, name',
  dayTemplates: 'id, name',
  timeBlocks: 'id, dayTemplateId, categoryId, startTime, endTime',
  plannedDays: 'id, date, dayTemplateId',
})

db.version(6).stores({
  tasks: 'id, title, status, createdAt, category, priority, categoryId, plannedDayId',
  categories: 'id, name',
  dayTemplates: 'id, name',
  timeBlocks: 'id, dayTemplateId, categoryId, startTime, endTime',
  plannedDays: 'id, &date, dayTemplateId',
})

db.version(7).stores({
  tasks: 'id, title, status, createdAt, category, priority, categoryId, plannedDayId, timeBlockId',
  categories: 'id, name',
  dayTemplates: 'id, name',
  timeBlocks: 'id, dayTemplateId, categoryId, startTime, endTime',
  plannedDays: 'id, &date, dayTemplateId',
})

db.version(8)
  .stores({
    tasks:
      'id, title, status, createdAt, category, priority, categoryId, plannedDayId, timeBlockId, [status+plannedDayId]',
    categories: 'id, name',
    dayTemplates: 'id, name',
    timeBlocks: 'id, dayTemplateId, categoryId, startTime, endTime',
    plannedDays: 'id, &date, dayTemplateId',
  })
  .upgrade(async (tx) => {
    await tx
      .table('tasks')
      .toCollection()
      .modify((task) => {
        if (task.plannedDayId === null || task.plannedDayId === undefined) {
          task.plannedDayId = ''
        }
      })
  })
