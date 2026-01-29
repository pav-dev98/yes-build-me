import db from './index.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql')

export function initDatabase() {
  const schema = fs.readFileSync(schemaPath, 'utf-8')
  db.exec(schema)
  console.log('Database schema initialized')
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initDatabase()
}
