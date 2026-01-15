const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder().setName("serverinfo").setDescription("View server information"),

  async execute(interaction) {
    const guild = interaction.guild
    await guild.members.fetch()

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
        { name: "Members", value: `${guild.memberCount}`, inline: true },
        { name: "Roles", value: `${guild.roles.cache.size}`, inline: true },
        { name: "Channels", value: `${guild.channels.cache.size}`, inline: true },
        { name: "Boosts", value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
        { name: "Boost Level", value: `${guild.premiumTier}`, inline: true },
        { name: "Created", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "Verification", value: guild.verificationLevel.toString(), inline: true },
      )
      .setTimestamp()

    if (guild.banner) embed.setImage(guild.bannerURL({ size: 512 }))

    await interaction.reply({ embeds: [embed] })
  },
}
