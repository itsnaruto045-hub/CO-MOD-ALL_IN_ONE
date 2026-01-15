import User from "../database/schemas/User.js"

const cooldowns = {
  daily: 24 * 60 * 60 * 1000, // 24 hours
  weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
  monthly: 30 * 24 * 60 * 60 * 1000, // 30 days
  work: 30 * 60 * 1000, // 30 minutes
  hunt: 45 * 60 * 1000, // 45 minutes
  beg: 60 * 1000, // 1 minute
  crime: 2 * 60 * 60 * 1000, // 2 hours
  rob: 4 * 60 * 60 * 1000, // 4 hours
}

export async function checkCooldown(odbc, action) {
  const user = await User.findOne({ odbc })
  if (!user) return { ready: true }

  const lastUse = user.cooldowns?.[action]
  if (!lastUse) return { ready: true }

  const cooldownTime = cooldowns[action] || 0
  const expiresAt = new Date(lastUse).getTime() + cooldownTime
  const now = Date.now()

  if (now >= expiresAt) {
    return { ready: true }
  }

  return {
    ready: false,
    remaining: expiresAt - now,
    expiresAt: new Date(expiresAt),
  }
}

export async function setCooldown(odbc, action) {
  await User.findOneAndUpdate({ odbc }, { $set: { [`cooldowns.${action}`]: new Date() } }, { upsert: true })
}

export function getCooldownDuration(action) {
  return cooldowns[action] || 0
}
