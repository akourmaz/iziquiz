/**
 * Vercel serverless function — приём заявки из квиза и пересылка в Telegram.
 *
 * Клиент (index.html) шлёт сюда POST /api/submit  { summary, intake }.
 * Токен и chat_id берутся ТОЛЬКО из переменных окружения Vercel —
 * в коде и в гите их нет:
 *     TELEGRAM_BOT_TOKEN   — токен бота от @BotFather
 *     TELEGRAM_CHAT_ID     — куда слать лиды (ваш chat_id или id группы)
 *
 * Настройка: Vercel → Project → Settings → Environment Variables.
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' })

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return res.status(500).json({ ok: false, error: 'config: no token/chat_id in env' })

  let body = req.body
  if (!body || typeof body === 'string') {
    try { body = JSON.parse(body || (await readRaw(req)) || '{}') } catch { body = {} }
  }

  const summary = (body && body.summary) || 'Новая заявка (без текста)'
  let text = summary
  if (body && body.intake) {
    const j = JSON.stringify(body.intake, null, 2)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    text += `\n\n<pre>${j}</pre>`
  }

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    })
    const d = await r.json()
    if (d.ok) return res.status(200).json({ ok: true })
    return res.status(502).json({ ok: false, error: d.description || 'tg error' })
  } catch (e) {
    return res.status(502).json({ ok: false, error: String(e) })
  }
}

function readRaw(req) {
  return new Promise((resolve) => {
    let s = ''
    req.on('data', (c) => (s += c))
    req.on('end', () => resolve(s))
    req.on('error', () => resolve(''))
  })
}
