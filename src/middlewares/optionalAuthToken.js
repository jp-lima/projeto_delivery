import jwt from 'jsonwebtoken'
import { ACCESS_COOKIE } from '../utils/cookies.js'

export function optionalAuthToken(req, res, next) {
  const token =
    req.cookies?.[ACCESS_COOKIE] ??
    req.headers['authorization']?.split(' ')[1]

  if (!token) {
    req.user = null
    return next()
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    req.user = null
  }
  next()
}
