module.exports = {
  async execute(client, ban) {
    // Track for anti-nuke
    const auditLogs = await ban.guild
      .fetchAuditLogs({
        type: 22, // GuildBanAdd
        limit: 1,
      })
      .catch(() => null)

    if (!auditLogs) return

    const entry = auditLogs.entries.first()
    if (!entry || entry.executor.bot) return

    await client.antiNukeManager.handleAction(ban.guild, entry.executor.id, "ban")
  },
}
