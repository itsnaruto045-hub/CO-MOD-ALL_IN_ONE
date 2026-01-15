const { EmbedBuilder, PermissionFlagsBits, AuditLogEvent } = require("discord.js")
const Guild = require("../../database/schemas/Guild")

class ModerationManager {
  constructor(client) {
    this.client = client
    this.warnCache = new Map()
    this.muteCache = new Map()
  }

  // Moderation Actions
  async warn(guild, moderator, target, reason) {
    const guildData = (await Guild.findOne({ guildId: guild.id })) || (await Guild.create({ guildId: guild.id }))

    const warning = {
      moderator: moderator.id,
      reason: reason || "No reason provided",
      timestamp: new Date(),
    }

    if (!guildData.moderation) guildData.moderation = {}
    if (!guildData.moderation.warnings) guildData.moderation.warnings = new Map()

    const userWarnings = guildData.moderation.warnings.get(target.id) || []
    userWarnings.push(warning)
    guildData.moderation.warnings.set(target.id, userWarnings)
    await guildData.save()

    await this.logModAction(guild, "WARN", moderator, target, reason, userWarnings.length)

    return userWarnings.length
  }

  async kick(guild, moderator, target, reason) {
    if (!target.kickable) throw new Error("Cannot kick this member")

    try {
      await target
        .send({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff6b6b)
              .setTitle(`You have been kicked from ${guild.name}`)
              .addFields({ name: "Reason", value: reason || "No reason provided" })
              .setTimestamp(),
          ],
        })
        .catch(() => {})

      await target.kick(reason)
      await this.logModAction(guild, "KICK", moderator, target.user, reason)
      return true
    } catch (error) {
      throw error
    }
  }

  async ban(guild, moderator, target, reason, days = 0) {
    try {
      const member = guild.members.cache.get(target.id)
      if (member) {
        await member
          .send({
            embeds: [
              new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle(`You have been banned from ${guild.name}`)
                .addFields({ name: "Reason", value: reason || "No reason provided" })
                .setTimestamp(),
            ],
          })
          .catch(() => {})
      }

      await guild.members.ban(target.id, { deleteMessageDays: days, reason })
      await this.logModAction(guild, "BAN", moderator, target, reason)
      return true
    } catch (error) {
      throw error
    }
  }

  async unban(guild, moderator, userId, reason) {
    try {
      await guild.members.unban(userId, reason)
      const user = await this.client.users.fetch(userId)
      await this.logModAction(guild, "UNBAN", moderator, user, reason)
      return true
    } catch (error) {
      throw error
    }
  }

  async timeout(guild, moderator, target, duration, reason) {
    if (!target.moderatable) throw new Error("Cannot timeout this member")

    try {
      await target.timeout(duration, reason)
      await this.logModAction(guild, "TIMEOUT", moderator, target.user, reason, null, duration)
      return true
    } catch (error) {
      throw error
    }
  }

  async removeTimeout(guild, moderator, target, reason) {
    try {
      await target.timeout(null, reason)
      await this.logModAction(guild, "UNTIMEOUT", moderator, target.user, reason)
      return true
    } catch (error) {
      throw error
    }
  }

  async softban(guild, moderator, target, reason, days = 7) {
    try {
      await guild.members.ban(target.id, { deleteMessageDays: days, reason: `Softban: ${reason}` })
      await guild.members.unban(target.id, "Softban complete")
      await this.logModAction(guild, "SOFTBAN", moderator, target, reason)
      return true
    } catch (error) {
      throw error
    }
  }

  async purge(channel, amount, filter = null) {
    const messages = await channel.messages.fetch({ limit: Math.min(amount + 1, 100) })
    let filtered = messages

    if (filter) {
      if (filter.user) {
        filtered = messages.filter((m) => m.author.id === filter.user)
      } else if (filter.bots) {
        filtered = messages.filter((m) => m.author.bot)
      } else if (filter.humans) {
        filtered = messages.filter((m) => !m.author.bot)
      } else if (filter.contains) {
        filtered = messages.filter((m) => m.content.toLowerCase().includes(filter.contains.toLowerCase()))
      } else if (filter.attachments) {
        filtered = messages.filter((m) => m.attachments.size > 0)
      } else if (filter.embeds) {
        filtered = messages.filter((m) => m.embeds.length > 0)
      }
    }

    const toDelete = Array.from(filtered.values()).slice(0, amount)
    const deleted = await channel.bulkDelete(toDelete, true)
    return deleted.size
  }

  async slowmode(channel, seconds) {
    await channel.setRateLimitPerUser(seconds)
    return true
  }

  // Logging
  async logModAction(guild, action, moderator, target, reason, count = null, duration = null) {
    const guildData = await Guild.findOne({ guildId: guild.id })
    if (!guildData?.moderation?.logChannel) return

    const logChannel = guild.channels.cache.get(guildData.moderation.logChannel)
    if (!logChannel) return

    const colors = {
      WARN: 0xffd93d,
      KICK: 0xff6b6b,
      BAN: 0xff0000,
      UNBAN: 0x6bff6b,
      TIMEOUT: 0xff9500,
      UNTIMEOUT: 0x6bff6b,
      SOFTBAN: 0xff4500,
    }

    const embed = new EmbedBuilder()
      .setColor(colors[action] || 0x5865f2)
      .setTitle(`Moderation Action: ${action}`)
      .addFields(
        { name: "Target", value: `${target.tag || target.user?.tag} (${target.id})`, inline: true },
        { name: "Moderator", value: `${moderator.tag} (${moderator.id})`, inline: true },
        { name: "Reason", value: reason || "No reason provided" },
      )
      .setTimestamp()

    if (count) embed.addFields({ name: "Warning Count", value: `${count}`, inline: true })
    if (duration) embed.addFields({ name: "Duration", value: this.formatDuration(duration), inline: true })

    await logChannel.send({ embeds: [embed] })
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  parseDuration(str) {
    const regex = /(\d+)(s|m|h|d|w)/gi
    let total = 0
    let match

    while ((match = regex.exec(str)) !== null) {
      const value = Number.parseInt(match[1])
      const unit = match[2].toLowerCase()

      switch (unit) {
        case "s":
          total += value * 1000
          break
        case "m":
          total += value * 60 * 1000
          break
        case "h":
          total += value * 60 * 60 * 1000
          break
        case "d":
          total += value * 24 * 60 * 60 * 1000
          break
        case "w":
          total += value * 7 * 24 * 60 * 60 * 1000
          break
      }
    }

    return total
  }
}

module.exports = ModerationManager
