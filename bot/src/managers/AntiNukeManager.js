const { AuditLogEvent, PermissionFlagsBits } = require("discord.js")
const { Collection } = require("discord.js")
const GuildConfig = require("../database/models/GuildConfig")
const { ANTINUKE } = require("../utils/Constants")
const Logger = require("../utils/Logger")

class AntiNukeManager {
  constructor(client) {
    this.client = client
    this.actionCache = new Collection()
    this.quarantinedUsers = new Collection()
  }

  getActionKey(guildId, userId, action) {
    return `${guildId}:${userId}:${action}`
  }

  async trackAction(guildId, userId, action) {
    const key = this.getActionKey(guildId, userId, action)
    const now = Date.now()

    if (!this.actionCache.has(key)) {
      this.actionCache.set(key, [])
    }

    const actions = this.actionCache.get(key)
    actions.push(now)

    // Clean old actions outside time window
    const filtered = actions.filter((time) => now - time < ANTINUKE.TIME_WINDOW)
    this.actionCache.set(key, filtered)

    return filtered.length
  }

  getThreshold(action) {
    const thresholds = {
      ban: ANTINUKE.BAN_THRESHOLD,
      kick: ANTINUKE.KICK_THRESHOLD,
      channelDelete: ANTINUKE.CHANNEL_DELETE_THRESHOLD,
      roleDelete: ANTINUKE.ROLE_DELETE_THRESHOLD,
      webhookCreate: ANTINUKE.WEBHOOK_CREATE_THRESHOLD,
    }
    return thresholds[action] || 3
  }

  async handleAction(guild, userId, action) {
    const config = await this.client.getGuildConfig(guild.id)

    if (!config.antiNuke?.enabled) return
    if (config.antiNuke?.whitelistedUsers?.includes(userId)) return
    if (userId === this.client.config.ownerId) return
    if (userId === guild.ownerId) return

    const actionCount = await this.trackAction(guild.id, userId, action)
    const threshold = this.getThreshold(action)

    if (actionCount >= threshold) {
      await this.punishUser(guild, userId, action)
      Logger.warn(`Anti-nuke triggered in ${guild.name}: ${userId} performed ${actionCount} ${action} actions`)
    }
  }

  async punishUser(guild, userId, action) {
    try {
      const member = await guild.members.fetch(userId).catch(() => null)
      if (!member) return

      // Strip all roles
      const roles = member.roles.cache.filter((r) => r.id !== guild.id)
      await member.roles.remove(roles, `Anti-nuke: ${action} threshold exceeded`)

      // Apply quarantine role if exists
      const config = await this.client.getGuildConfig(guild.id)
      if (config.antiNuke?.quarantineRoleId) {
        const quarantineRole = guild.roles.cache.get(config.antiNuke.quarantineRoleId)
        if (quarantineRole) {
          await member.roles.add(quarantineRole, "Anti-nuke quarantine")
        }
      }

      // Log the action
      this.quarantinedUsers.set(`${guild.id}:${userId}`, {
        userId,
        guildId: guild.id,
        action,
        timestamp: Date.now(),
        originalRoles: roles.map((r) => r.id),
      })

      // Notify owner
      const owner = await guild.fetchOwner()
      await owner
        .send({
          embeds: [
            {
              color: 0xff0000,
              title: "⚠️ Anti-Nuke Alert",
              description: `User <@${userId}> was quarantined in **${guild.name}**`,
              fields: [
                { name: "Action", value: action, inline: true },
                {
                  name: "Count",
                  value: `${this.getThreshold(action)}+ in ${ANTINUKE.TIME_WINDOW / 1000}s`,
                  inline: true,
                },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        })
        .catch(() => {})
    } catch (error) {
      Logger.error(`Failed to punish user ${userId}: ${error.message}`)
    }
  }

  async lockdownServer(guild) {
    const config = await this.client.getGuildConfig(guild.id)

    for (const channel of guild.channels.cache.values()) {
      if (channel.permissionOverwrites) {
        await channel.permissionOverwrites
          .edit(
            guild.roles.everyone,
            {
              SendMessages: false,
              Connect: false,
            },
            { reason: "Server lockdown" },
          )
          .catch(() => {})
      }
    }

    config.antiNuke.lockdownActive = true
    await config.save()

    Logger.info(`Server ${guild.name} locked down`)
  }

  async unlockServer(guild) {
    const config = await this.client.getGuildConfig(guild.id)

    for (const channel of guild.channels.cache.values()) {
      if (channel.permissionOverwrites) {
        await channel.permissionOverwrites
          .edit(
            guild.roles.everyone,
            {
              SendMessages: null,
              Connect: null,
            },
            { reason: "Lockdown lifted" },
          )
          .catch(() => {})
      }
    }

    config.antiNuke.lockdownActive = false
    await config.save()

    Logger.info(`Server ${guild.name} lockdown lifted`)
  }

  async restoreUser(guild, userId) {
    const key = `${guild.id}:${userId}`
    const data = this.quarantinedUsers.get(key)

    if (!data) return false

    const member = await guild.members.fetch(userId).catch(() => null)
    if (!member) return false

    // Restore original roles
    for (const roleId of data.originalRoles) {
      const role = guild.roles.cache.get(roleId)
      if (role) {
        await member.roles.add(role, "Quarantine lifted").catch(() => {})
      }
    }

    // Remove quarantine role
    const config = await this.client.getGuildConfig(guild.id)
    if (config.antiNuke?.quarantineRoleId) {
      await member.roles.remove(config.antiNuke.quarantineRoleId, "Quarantine lifted").catch(() => {})
    }

    this.quarantinedUsers.delete(key)
    return true
  }
}

module.exports = AntiNukeManager
