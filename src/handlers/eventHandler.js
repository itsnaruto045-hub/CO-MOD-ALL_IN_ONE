import { readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function loadEvents(client) {
  const eventsPath = join(__dirname, "..", "events")
  const eventFiles = readdirSync(eventsPath).filter((f) => f.endsWith(".js"))

  for (const file of eventFiles) {
    try {
      const { default: event } = await import(`../events/${file}`)

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client))
      } else {
        client.on(event.name, (...args) => event.execute(...args, client))
      }
    } catch (error) {
      console.error(`[EVT] Failed to load ${file}:`, error)
    }
  }
}
