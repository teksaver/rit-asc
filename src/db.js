import Dexie from 'dexie'

export const db = new Dexie('RouteInDB')

db.version(1).stores({
  tasks: '++id, title, status, createdAt, category, priority',
})

export default db
