import { Router } from 'express'
import bcrypt from 'bcrypt'
import { createUser, findByUsername, findByEmail, findById, updateUser } from '../models/user.js'
import { authenticateToken, generateToken } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' })
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Check if user exists
    if (findByUsername(username)) {
      return res.status(400).json({ error: 'Username already taken' })
    }

    if (findByEmail(email)) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 10)
    const userId = createUser({
      username,
      email,
      passwordHash,
      displayName: displayName || username
    })

    const user = findById(userId)
    const token = generateToken(user)

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url
      },
      token
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Find user by username or email
    const user = findByUsername(username) || findByEmail(username)

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(user)

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url
      },
      token
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = findById(req.user.id)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at
    })
  } catch (err) {
    console.error('Get user error:', err)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

// PUT /api/auth/me
router.put('/me', authenticateToken, (req, res) => {
  try {
    const { displayName, avatarUrl } = req.body

    updateUser(req.user.id, { displayName, avatarUrl })

    const user = findById(req.user.id)

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url
    })
  } catch (err) {
    console.error('Update user error:', err)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

export default router
