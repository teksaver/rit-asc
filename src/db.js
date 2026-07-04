import Dexie from 'dexie'

export const db = new Dexie('RouteInDB')

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
