export default {
  name: "guildMemberRemove",

  async execute(member, client) {
    try {
      await client.welcome.handleLeave(member)
    } catch (error) {
      console.error("[GOODBYE] Error:", error)
    }
  },
}
