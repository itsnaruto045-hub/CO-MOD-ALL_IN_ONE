import { ActivityType } from "discord.js"
import { initMusic } from "../systems/music/musicManager.js"

export default {
  name: "ready",
  once: true,

  async execute(client) {
    console.log(`[SDF] Logged in as ${client.user.tag}`)

    // Initialize music system
    await initMusic(client)

    // Set activity
    client.user.setActivity("% SDF >.", { type: ActivityType.Watching })

    // Initialize anti-nuke
    client.antinuke.initialize()

    console.log("[SDF] Bot fully operational")
  },
}
