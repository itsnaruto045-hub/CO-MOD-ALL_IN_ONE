export default {
  name: "guildAuditLogEntryCreate",

  async execute(auditLog, guild, client) {
    try {
      await client.antinuke.handleAuditLog(auditLog, guild)
    } catch (error) {
      console.error("[ANTINUKE] Error:", error)
    }
  },
}
