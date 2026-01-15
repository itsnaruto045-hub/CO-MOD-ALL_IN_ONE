const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user from the server")
    .addStringOption((option) => option.setName("user").setDescription("User ID to unban").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for the unban"))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString("user")
    const reason = interaction.options.getString("reason") || "No reason provided"

    try {
      await interaction.client.moderation.unban(interaction.guild, interaction.user, userId, reason)
      const user = await interaction.client.users.fetch(userId)

      const embed = new EmbedBuilder()
        .setColor(0x6bff6b)
        .setTitle("Member Unbanned")
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: "User", value: `${user.tag}`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Reason", value: reason },
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to unban user. Make sure the ID is correct.", ephemeral: true })
    }
  },
}
