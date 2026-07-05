import { describe, it, expect } from 'vitest'
import Dexie from 'dexie'
import { db } from './db'

// These tests characterize the IndexedDB/Dexie *migration* contract that
// src/db.js depends on — the version-to-version upgrade path that the rest of
// the suite never exercises (every other test opens the database directly at
// its latest version, so the upgrade code in src/db.js is otherwise untested).
//
// They deliberately use standalone, uniquely-named databases (never the app's
// `RouteInDB` singleton) so each test can drive an exact version sequence in
// isolation. Each test references the src/db.js line it protects.

let counter = 0
function freshName(label) {
  counter += 1
  return `MigrationTest_${label}_${counter}_${Date.now()}`
}

// Dedupe helper matching the fix pattern: keep the first row seen per date,
// drop the rest. Used inside an .upgrade() callback.
function dedupeByDate() {
  const seen = new Set()
  return (row, ref) => {
    if (seen.has(row.date)) {
      delete ref.value
    } else {
      seen.add(row.date)
    }
  }
}

describe('plannedDays: adding the unique &date index (src/db.js:44)', () => {
  it('FAILS to open when a legacy store already holds two rows with the same date', async () => {
    const name = freshName('v5dupes')

    // A "v5" database, where `date` is a plain, NON-unique index.
    const legacy = new Dexie(name)
    legacy.version(5).stores({ plannedDays: 'id, date, dayTemplateId' })
    await legacy.open()
    await legacy.plannedDays.bulkAdd([
      { id: 'a', date: '2026-07-06', dayTemplateId: 't1' },
      { id: 'b', date: '2026-07-06', dayTemplateId: 't2' }, // duplicate date
    ])
    legacy.close()

    // Re-open with v6 turning `date` unique — exactly what src/db.js:44 does.
    const upgraded = new Dexie(name)
    upgraded.version(5).stores({ plannedDays: 'id, date, dayTemplateId' })
    upgraded.version(6).stores({ plannedDays: 'id, &date, dayTemplateId' })

    try {
      await expect(upgraded.open()).rejects.toThrow()
    } finally {
      upgraded.close()
      await Dexie.delete(name)
    }
  })

  it('is NOT fixed by adding a dedupe .upgrade() in the SAME version as the unique index', async () => {
    // The intuitive fix — add `&date` and a dedupe .upgrade() together in v6 —
    // does not work: Dexie applies the index diff (and IndexedDB builds/validates
    // the unique index) BEFORE the .upgrade() callback runs, so the build has
    // already aborted by the time dedupe would execute.
    const name = freshName('naivefix')

    const legacy = new Dexie(name)
    legacy.version(5).stores({ plannedDays: 'id, date, dayTemplateId' })
    await legacy.open()
    await legacy.plannedDays.bulkAdd([
      { id: 'a', date: '2026-07-06', dayTemplateId: 't1' },
      { id: 'b', date: '2026-07-06', dayTemplateId: 't2' },
    ])
    legacy.close()

    const upgraded = new Dexie(name)
    upgraded.version(5).stores({ plannedDays: 'id, date, dayTemplateId' })
    upgraded
      .version(6)
      .stores({ plannedDays: 'id, &date, dayTemplateId' })
      .upgrade(async (tx) => {
        await tx.table('plannedDays').toCollection().modify(dedupeByDate())
      })

    try {
      await expect(upgraded.open()).rejects.toThrow()
    } finally {
      upgraded.close()
      await Dexie.delete(name)
    }
  })

  it('upgrades cleanly when dedupe runs in an EARLIER version than the one adding &date', async () => {
    // The correct sequencing: dedupe in version N (date still non-unique), then
    // add the unique &date in version N+1.
    const name = freshName('twostepfix')

    const legacy = new Dexie(name)
    legacy.version(5).stores({ plannedDays: 'id, date, dayTemplateId' })
    await legacy.open()
    await legacy.plannedDays.bulkAdd([
      { id: 'a', date: '2026-07-06', dayTemplateId: 't1' },
      { id: 'b', date: '2026-07-06', dayTemplateId: 't2' },
      { id: 'c', date: '2026-07-07', dayTemplateId: 't3' },
    ])
    legacy.close()

    const upgraded = new Dexie(name)
    upgraded.version(5).stores({ plannedDays: 'id, date, dayTemplateId' })
    upgraded
      .version(6)
      .stores({ plannedDays: 'id, date, dayTemplateId' })
      .upgrade(async (tx) => {
        await tx.table('plannedDays').toCollection().modify(dedupeByDate())
      })
    upgraded.version(7).stores({ plannedDays: 'id, &date, dayTemplateId' })

    try {
      await upgraded.open()
      const rows = await upgraded.plannedDays.orderBy('date').toArray()
      expect(rows.map((r) => r.date)).toEqual(['2026-07-06', '2026-07-07'])
      // The survivor for the duplicated date is the first one seen.
      expect(rows.find((r) => r.date === '2026-07-06').id).toBe('a')
    } finally {
      upgraded.close()
      await Dexie.delete(name)
    }
  })
})

describe('the REAL app database (src/db.js) — regression guard', () => {
  it('upgrades a legacy v5 database that holds duplicate dates, without failing to open', async () => {
    // This is bound to the actual src/db.js schema (not a standalone mirror):
    // it fails the moment the v6 dedupe is removed or the constraint is moved
    // back into the same version as the index.
    await Dexie.delete('RouteInDB')

    // Recreate the exact pre-fix situation: a v5 database with two plannedDays
    // sharing a date (impossible to create today, but reachable before v6 shipped).
    const legacy = new Dexie('RouteInDB')
    legacy.version(5).stores({
      tasks: 'id, title, status, createdAt, category, priority, categoryId, plannedDayId',
      categories: 'id, name',
      dayTemplates: 'id, name',
      timeBlocks: 'id, dayTemplateId, categoryId, startTime, endTime',
      plannedDays: 'id, date, dayTemplateId',
    })
    await legacy.open()
    await legacy.plannedDays.bulkAdd([
      { id: 'a', date: '2026-07-06', dayTemplateId: 't1' },
      { id: 'b', date: '2026-07-06', dayTemplateId: 't2' }, // duplicate
    ])
    legacy.close()

    // Opening the real app db must run v6 (dedupe) then v7 (&date) cleanly.
    await expect(db.open()).resolves.toBeDefined()
    const rows = await db.plannedDays.where('date').equals('2026-07-06').toArray()
    expect(rows).toHaveLength(1)
  })
})

describe('tasks: the plannedDayId sentinel upgrade (src/db.js:64)', () => {
  it('rewrites null/undefined plannedDayId to the "" sentinel so the task is found via [status+plannedDayId]', async () => {
    const name = freshName('sentinel')

    // A "v7" database whose tasks predate the sentinel: plannedDayId is
    // null/undefined, which IndexedDB cannot index in a compound key.
    const legacy = new Dexie(name)
    legacy.version(7).stores({ tasks: 'id, status, plannedDayId, timeBlockId' })
    await legacy.open()
    await legacy.tasks.bulkAdd([
      { id: 't1', status: 'inbox', title: 'undefined plannedDayId' },
      { id: 't2', status: 'inbox', plannedDayId: null, title: 'null plannedDayId' },
      { id: 't3', status: 'inbox', plannedDayId: 'pd-1', title: 'already planned' },
    ])
    legacy.close()

    // v8 adds the compound index and rewrites the sentinel — mirrors src/db.js:55-73.
    const upgraded = new Dexie(name)
    upgraded.version(7).stores({ tasks: 'id, status, plannedDayId, timeBlockId' })
    upgraded
      .version(8)
      .stores({
        tasks: 'id, status, plannedDayId, timeBlockId, [status+plannedDayId]',
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

    try {
      await upgraded.open()
      const inbox = await upgraded.tasks
        .where('[status+plannedDayId]')
        .equals(['inbox', ''])
        .toArray()
      // Without the sentinel rewrite, t1 and t2 would silently drop out of this index.
      expect(inbox.map((t) => t.id).sort()).toEqual(['t1', 't2'])
    } finally {
      upgraded.close()
      await Dexie.delete(name)
    }
  })
})

describe('plannedDays: cross-tab concurrency guarded by &date (src/db.js:44)', () => {
  it('lets only ONE of two concurrent connections plan the same date', async () => {
    const name = freshName('crosstab')

    const seed = new Dexie(name)
    seed.version(6).stores({ plannedDays: 'id, &date, dayTemplateId' })
    await seed.open()
    seed.close()

    // Two independent connections = two browser tabs.
    const tabA = new Dexie(name)
    tabA.version(6).stores({ plannedDays: 'id, &date, dayTemplateId' })
    const tabB = new Dexie(name)
    tabB.version(6).stores({ plannedDays: 'id, &date, dayTemplateId' })
    await Promise.all([tabA.open(), tabB.open()])

    const results = await Promise.allSettled([
      tabA.plannedDays.add({ id: 'a', date: '2026-07-06', dayTemplateId: 't' }),
      tabB.plannedDays.add({ id: 'b', date: '2026-07-06', dayTemplateId: 't' }),
    ])

    try {
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
      expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1)

      const rows = await tabA.plannedDays.where('date').equals('2026-07-06').toArray()
      expect(rows).toHaveLength(1)
    } finally {
      tabA.close()
      tabB.close()
      await Dexie.delete(name)
    }
  })
})
