const { EmbedBuilder, AttachmentBuilder } = require("discord.js")
const Guild = require("../../database/schemas/Guild")

class WelcomeManager {
  constructor(client) {
    this.client = client
  }

  async handleJoin(member) {
    const guildData = await Guild.findOne({ guildId: member.guild.id })
    if (!guildData?.welcome?.enabled || !guildData.welcome.channel) return

    const channel = member.guild.channels.cache.get(guildData.welcome.channel)
    if (!channel) return

    const message = this.parseMessage(guildData.welcome.message || "Welcome {user} to {server}!", member)

    const embed = new EmbedBuilder()
      .setColor(guildData.welcome.color || 0x5865f2)
      .setTitle("Welcome!")
      .setDescription(message)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "Member Count", value: `${member.guild.memberCount}`, inline: true },
        { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
      )
      .setTimestamp()

    await channel.send({ embeds: [embed] })

    // Auto role
    if (guildData.welcome.autoRole) {
      const role = member.guild.roles.cache.get(guildData.welcome.autoRole)
      if (role && role.position < member.guild.members.me.roles.highest.position) {
        await member.roles.add(role).catch(() => {})
      }
    }
  }

  async handleLeave(member) {
    const guildData = await Guild.findOne({ guildId: member.guild.id })
    if (!guildData?.goodbye?.enabled || !guildData.goodbye.channel) return

    const channel = member.guild.channels.cache.get(guildData.goodbye.channel)
    if (!channel) return

    const message = this.parseMessage(guildData.goodbye.message || "{user} has left the server.", member)

    const embed = new EmbedBuilder()
      .setColor(guildData.goodbye.color || 0xff6b6b)
      .setTitle("Goodbye!")
      .setDescription(message)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .addFields({ name: "Member Count", value: `${member.guild.memberCount}`, inline: true })
      .setTimestamp()

    await channel.send({ embeds: [embed] })
  }

  parseMessage(message, member) {
    return message
      .replace(/{user}/g, member.toString())
      .replace(/{username}/g, member.user.username)
      .replace(/{tag}/g, member.user.tag)
      .replace(/{server}/g, member.guild.name)
      .replace(/{membercount}/g, member.guild.memberCount.toString())
  }
}

module.exports = WelcomeManager
