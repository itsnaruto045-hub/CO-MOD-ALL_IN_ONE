const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("View user information")
    .addUserOption((opt) => opt.setName("user").setDescription("User to view info for")),

  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user
    const member = interaction.guild.members.cache.get(user.id)

    const embed = new EmbedBuilder()
      .setColor(member?.displayHexColor || 0x5865f2)
      .setTitle(user.tag)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "ID", value: user.id, inline: true },
        { name: "Bot", value: user.bot ? "Yes" : "No", inline: true },
        { name: "Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
      )
      .setTimestamp()

    if (member) {
      embed.addFields(
        { name: "Joined", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: "Nickname", value: member.nickname || "None", inline: true },
        { name: "Roles", value: `${member.roles.cache.size - 1}`, inline: true },
        { name: "Highest Role", value: `${member.roles.highest}`, inline: true },
      )
    }

    await interaction.reply({ embeds: [embed] })
  },
}
