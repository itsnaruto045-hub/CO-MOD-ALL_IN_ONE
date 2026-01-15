const ms = require("ms")

class Helpers {
  static formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
    return num.toLocaleString()
  }

  static formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  static parseTime(str) {
    return ms(str) || 0
  }

  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  static randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  static shuffle(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  static progressBar(current, max, size = 10) {
    const percentage = current / max
    const filled = Math.round(size * percentage)
    const empty = size - filled
    return "█".repeat(filled) + "░".repeat(empty)
  }

  static animatedProgressBar(current, max, size = 10, style = "default") {
    const percentage = current / max
    const filled = Math.round(size * percentage)
    const empty = size - filled

    const styles = {
      default: { filled: "▓", empty: "░" },
      blocks: { filled: "█", empty: "░" },
      dots: { filled: "●", empty: "○" },
      arrows: { filled: "▸", empty: "▹" },
      hacker: { filled: "1", empty: "0" },
    }

    const s = styles[style] || styles.default
    return s.filled.repeat(filled) + s.empty.repeat(empty)
  }

  static chunk(array, size) {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  static truncate(str, length) {
    if (str.length <= length) return str
    return str.slice(0, length - 3) + "..."
  }

  static generateId(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  static calculateSuccessRate(baseRate, modifiers = {}) {
    let rate = baseRate
    if (modifiers.luck) rate += modifiers.luck * 0.5
    if (modifiers.streak) rate += Math.min(modifiers.streak * 2, 10)
    if (modifiers.premium) rate += 5
    return Math.min(Math.max(rate, 5), 95)
  }
}

module.exports = Helpers
