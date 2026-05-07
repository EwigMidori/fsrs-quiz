import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { StateStorage } from 'zustand/middleware'

interface ExamhackerDb extends DBSchema {
  kv: {
    key: string
    value: string
  }
}

const DB_NAME = 'examhacker-db'
const STORE_NAME = 'kv'

let dbPromise: Promise<IDBPDatabase<ExamhackerDb>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<ExamhackerDb>(DB_NAME, 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME)
        }
      },
    })
  }

  return dbPromise
}

export const indexedDbStorage: StateStorage = {
  async getItem(name) {
    const database = await getDb()
    const value = await database.get(STORE_NAME, name)

    return value ?? null
  },
  async setItem(name, value) {
    const database = await getDb()
    await database.put(STORE_NAME, value, name)
  },
  async removeItem(name) {
    const database = await getDb()
    await database.delete(STORE_NAME, name)
  },
}
