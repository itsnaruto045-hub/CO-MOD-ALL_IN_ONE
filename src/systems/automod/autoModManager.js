const { EmbedBuilder } = require("discord.js")
const Guild = require("../../database/schemas/Guild")

class AutoModManager {
  constructor(client) {
    this.client = client
    this.spamCache = new Map()
    this.mentionCache = new Map()
  }

  async processMessage(message) {
    if (message.author.bot) return
    if (!message.guild) return

    const guildData = await Guild.findOne({ guildId: message.guild.id })
    if (!guildData?.automod?.enabled) return

    const config = guildData.automod
    const violations = []

    // Check for spam
    if (config.antiSpam?.enabled) {
      const isSpam = await this.checkSpam(message, config.antiSpam)
      if (isSpam) violations.push({ type: "spam", action: config.antiSpam.action })
    }

    // Check for mass mentions
    if (config.antiMention?.enabled) {
      const isMassMention = this.checkMassMention(message, config.antiMention)
      if (isMassMention) violations.push({ type: "mass_mention", action: config.antiMention.action })
    }

    // Check for banned words
    if (config.bannedWords?.enabled && config.bannedWords.words?.length > 0) {
      const hasBannedWord = this.checkBannedWords(message, config.bannedWords.words)
      if (hasBannedWord) violations.push({ type: "banned_word", action: config.bannedWords.action })
    }

    // Check for invite links
    if (config.antiInvite?.enabled) {
      const hasInvite = this.checkInviteLinks(message)
      if (hasInvite) violations.push({ type: "invite_link", action: config.antiInvite.action })
    }

    // Check for excessive caps
    if (config.antiCaps?.enabled) {
      const hasExcessiveCaps = this.checkExcessiveCaps(message, config.antiCaps.threshold || 70)
      if (hasExcessiveCaps) violations.push({ type: "excessive_caps", action: config.antiCaps.action })
    }

    // Check for links
    if (config.antiLink?.enabled) {
      const hasLink = this.checkLinks(message, config.antiLink.whitelist || [])
      if (hasLink) violations.push({ type: "link", action: config.antiLink.action })
    }

    // Process violations
    for (const violation of violations) {
      await this.handleViolation(message, violation)
    }
  }

  async checkSpam(message, config) {
    const key = `${message.guild.id}-${message.author.id}`
    const now = Date.now()
    const userMessages = this.spamCache.get(key) || []

    // Clean old messages
    const recentMessages = userMessages.filter((m) => now - m.timestamp < (config.interval || 5000))
    recentMessages.push({ timestamp: now, messageId: message.id })
    this.spamCache.set(key, recentMessages)

    return recentMessages.length >= (config.threshold || 5)
  }

  checkMassMention(message, config) {
    const mentionCount = message.mentions.users.size + message.mentions.roles.size
    return mentionCount >= (config.threshold || 5)
  }

  checkBannedWords(message, words) {
    const content = message.content.toLowerCase()
    return words.some((word) => content.includes(word.toLowerCase()))
  }

  checkInviteLinks(message) {
    const inviteRegex = /(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[^\s]+/gi
    return inviteRegex.test(message.content)
  }

  checkExcessiveCaps(message, threshold) {
    if (message.content.length < 10) return false
    const caps = message.content.replace(/[^A-Z]/g, "").length
    const letters = message.content.replace(/[^a-zA-Z]/g, "").length
    if (letters === 0) return false
    return (caps / letters) * 100 >= threshold
  }

  checkLinks(message, whitelist) {
    const urlRegex = /(https?:\/\/[^\s]+)/gi
    const matches = message.content.match(urlRegex)
    if (!matches) return false

    return matches.some((url) => {
      return !whitelist.some((whitelisted) => url.includes(whitelisted))
    })
  }

  async handleViolation(message, violation) {
    try {
      await message.delete().catch(() => {})

      const actionMessages = {
        spam: "Stop spamming!",
        mass_mention: "Do not mass mention users/roles!",
        banned_word: "That word is not allowed here!",
        invite_link: "Discord invite links are not allowed!",
        excessive_caps: "Please do not use excessive caps!",
        link: "Links are not allowed in this server!",
      }

      const warningMsg = await message.channel.send({
        embeds: [
          new EmbedBuilder().setColor(0xff6b6b).setDescription(`${message.author}, ${actionMessages[violation.type]}`),
        ],
      })

      setTimeout(() => warningMsg.delete().catch(() => {}), 5000)

      // Apply action
      if (violation.action === "timeout") {
        const member = message.guild.members.cache.get(message.author.id)
        if (member?.moderatable) {
          await member.timeout(5 * 60 * 1000, `AutoMod: ${violation.type}`)
        }
      } else if (violation.action === "kick") {
        const member = message.guild.members.cache.get(message.author.id)
        if (member?.kickable) {
          await member.kick(`AutoMod: ${violation.type}`)
        }
      } else if (violation.action === "ban") {
        const member = message.guild.members.cache.get(message.author.id)
        if (member?.bannable) {
          await member.ban({ reason: `AutoMod: ${violation.type}` })
        }
      }
    } catch (error) {
      console.error("AutoMod violation handling error:", error)
    }
  }
}

module.exports = AutoModManager
