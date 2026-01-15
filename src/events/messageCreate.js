export default {
  name: "messageCreate",

  async execute(message, client) {
    if (message.author.bot) return
    if (!message.guild) return

    // Process automod
    try {
      await client.automod.processMessage(message)
    } catch (error) {
      console.error("[AUTOMOD] Error:", error)
    }
  },
}
