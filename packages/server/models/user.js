import db from '../db/index.js'

export function createUser({ username, email, passwordHash, displayName, avatarUrl }) {
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash, display_name, avatar_url)
    VALUES (?, ?, ?, ?, ?)
  `)
  const result = stmt.run(username, email, passwordHash, displayName || username, avatarUrl || null)
  return result.lastInsertRowid
}

export function findByUsername(username) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
  return stmt.get(username)
}

export function findByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
  return stmt.get(email)
}

export function findById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
  return stmt.get(id)
}

export function updateUser(id, { displayName, avatarUrl }) {
  const stmt = db.prepare(`
    UPDATE users
    SET display_name = COALESCE(?, display_name),
        avatar_url = COALESCE(?, avatar_url)
    WHERE id = ?
  `)
  const result = stmt.run(displayName, avatarUrl, id)
  return result.changes > 0
}
