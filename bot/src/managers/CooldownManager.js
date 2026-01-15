const { Collection } = require("discord.js")

class CooldownManager {
  constructor(client) {
    this.client = client
    this.cooldowns = new Collection()
  }

  generateKey(userId, type) {
    return `${userId}:${type}`
  }

  isOnCooldown(userId, type) {
    const key = this.generateKey(userId, type)
    const cooldown = this.cooldowns.get(key)

    if (!cooldown) return false
    if (Date.now() >= cooldown.expiresAt) {
      this.cooldowns.delete(key)
      return false
    }
    return true
  }

  getRemainingTime(userId, type) {
    const key = this.generateKey(userId, type)
    const cooldown = this.cooldowns.get(key)

    if (!cooldown) return 0
    const remaining = cooldown.expiresAt - Date.now()
    return remaining > 0 ? remaining : 0
  }

  setCooldown(userId, type, duration) {
    const key = this.generateKey(userId, type)
    this.cooldowns.set(key, {
      userId,
      type,
      expiresAt: Date.now() + duration,
      duration,
    })
  }

  clearCooldown(userId, type) {
    const key = this.generateKey(userId, type)
    this.cooldowns.delete(key)
  }

  clearAllCooldowns(userId) {
    for (const [key] of this.cooldowns) {
      if (key.startsWith(userId)) {
        this.cooldowns.delete(key)
      }
    }
  }
}

module.exports = CooldownManager
