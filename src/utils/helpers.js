import ms from "ms"

export function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
  return num.toLocaleString()
}

export function formatCrypto(amount, decimals = 8) {
  return amount.toFixed(decimals)
}

export function parseTime(timeString) {
  return ms(timeString)
}

export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)]
}

export function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  let random = Math.random() * totalWeight

  for (const item of items) {
    if (random < item.weight) return item
    random -= item.weight
  }

  return items[items.length - 1]
}

export function isOwner(userId, client) {
  return userId === client.config.ownerId
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function chunk(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function sanitize(text) {
  return text.replace(/[`@]/g, "")
}
