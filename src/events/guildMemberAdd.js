export default {
  name: "guildMemberAdd",

  async execute(member, client) {
    try {
      await client.welcome.handleJoin(member)
    } catch (error) {
      console.error("[WELCOME] Error:", error)
    }
  },
}
