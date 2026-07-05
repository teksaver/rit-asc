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

// plannedDays.date becomes UNIQUE in v7 (below). v6 first removes any duplicate
// dates a pre-v6 database might hold — because Dexie applies a version's index
// diff (and IndexedDB builds/validates the unique index) BEFORE running that
// version's .upgrade() callback. Deduplicating in the SAME version as `&date`
// would run too late: the unique index build would already have aborted the
// open with a ConstraintError, leaving the database unopenable. The dedupe must
// therefore live in the version *before* the one that adds the constraint.
// See src/db.migrations.test.js for the executable proof of this ordering.
db.version(6)
  .stores({
    tasks: 'id, title, status, createdAt, category, priority, categoryId, plannedDayId',
    categories: 'id, name',
    dayTemplates: 'id, name',
    timeBlocks: 'id, dayTemplateId, categoryId, startTime, endTime',
    plannedDays: 'id, date, dayTemplateId',
  })
  .upgrade(async (tx) => {
    const seenDates = new Set()
    await tx
      .table('plannedDays')
      .toCollection()
      .modify((plannedDay, ref) => {
        if (seenDates.has(plannedDay.date)) {
          delete ref.value
        } else {
          seenDates.add(plannedDay.date)
        }
      })
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

// Last-resort recovery for a database that cannot be opened (e.g. a corrupted
// store or a migration that aborted). Deletes the local database and reloads so
// it is recreated from scratch at the current schema version. Data is lost, but
// the app is never left permanently stuck on a blank screen with no way out.
export async function resetDatabase() {
  try {
    db.close()
  } catch {
    // ignore — closing a database that never opened is fine
  }
  await db.delete()
  window.location.reload()
}
