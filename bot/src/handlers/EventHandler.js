const fs = require("fs")
const path = require("path")
const Logger = require("../utils/Logger")

class EventHandler {
  constructor(client) {
    this.client = client
  }

  async loadEvents() {
    const eventsPath = path.join(__dirname, "..", "events")
    const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"))

    for (const file of eventFiles) {
      try {
        const event = require(path.join(eventsPath, file))
        const eventName = file.replace(".js", "")

        if (event.once) {
          this.client.once(eventName, (...args) => event.execute(this.client, ...args))
        } else {
          this.client.on(eventName, (...args) => event.execute(this.client, ...args))
        }

        Logger.debug(`Loaded event: ${eventName}`)
      } catch (error) {
        Logger.error(`Failed to load event ${file}: ${error.message}`)
      }
    }

    Logger.info(`Loaded ${eventFiles.length} events`)
  }
}

module.exports = EventHandler
