const SDFEmbed = require("../structures/Embed")

module.exports = {
  async execute(client, member) {
    const config = await client.getGuildConfig(member.guild.id)

    // Auto roles
    if (config.autoRoles) {
      const roles = member.user.bot ? config.autoRoles.botRoles : config.autoRoles.memberRoles

      for (const roleId of roles || []) {
        const role = member.guild.roles.cache.get(roleId)
        if (role) {
          await member.roles.add(role).catch(() => {})
        }
      }
    }

    // Welcome message
    if (config.welcome?.enabled && config.welcome?.channelId) {
      const channel = member.guild.channels.cache.get(config.welcome.channelId)
      if (!channel) return

      const message = config.welcome.message
        .replace(/{user}/g, member.toString())
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, member.guild.name)
        .replace(/{memberCount}/g, member.guild.memberCount)

      if (config.welcome.embedEnabled) {
        const embed = new SDFEmbed()
          .setTitle("Welcome!")
          .setDescription(message)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setColor(0x00ff00)

        await channel.send({ embeds: [embed] })
      } else {
        await channel.send(message)
      }
    }
  },
}
