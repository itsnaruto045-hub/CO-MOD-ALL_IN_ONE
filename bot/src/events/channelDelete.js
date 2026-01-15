module.exports = {
  async execute(client, channel) {
    if (!channel.guild) return

    const auditLogs = await channel.guild
      .fetchAuditLogs({
        type: 12, // ChannelDelete
        limit: 1,
      })
      .catch(() => null)

    if (!auditLogs) return

    const entry = auditLogs.entries.first()
    if (!entry || entry.executor.bot) return

    await client.antiNukeManager.handleAction(channel.guild, entry.executor.id, "channelDelete")
  },
}
