import crypto from 'crypto'
import { ACCESS_COOKIE, CSRF_COOKIE } from '../utils/cookies.js'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next()

  if (!req.cookies?.[ACCESS_COOKIE]) return next()

  const cookieToken = req.cookies?.[CSRF_COOKIE]
  const headerToken = req.headers['x-csrf-token']

  if (!cookieToken || !headerToken) {
    return res.status(403).json({ error: 'CSRF token ausente' })
  }

  const a = Buffer.from(cookieToken)
  const b = Buffer.from(headerToken)

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).json({ error: 'CSRF token inválido' })
  }

  next()
}