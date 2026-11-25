import crypto from 'crypto'
import "dotenv/config"

export function apiKeyAuth(req, res, next) {
  const key = req.headers['x-api-key']

  if (!key) {
    return res.status(401).json({ error: 'API key ausente. Envie no header: x-api-key' })
  }

  const validKey = process.env.API_KEY

  if (!validKey) {
    console.error('API_KEY não definida no .env')
    return res.status(500).json({ error: 'Servidor mal configurado' })
  }

  // Comparação segura — evita timing attacks
  const keyBuffer   = Buffer.from(key)
  const validBuffer = Buffer.from(validKey)

  const same =
    keyBuffer.length === validBuffer.length &&
    crypto.timingSafeEqual(keyBuffer, validBuffer)

  if (!same) {
    return res.status(403).json({ error: 'API key inválida' })
  }

  next()
}
