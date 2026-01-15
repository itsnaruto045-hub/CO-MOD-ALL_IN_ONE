const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Remove timeout from a member")
    .addUserOption((option) => option.setName("user").setDescription("The user to untimeout").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for removing timeout"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember("user")
    const reason = interaction.options.getString("reason") || "No reason provided"

    if (!target) {
      return interaction.reply({ content: "User not found in this server.", ephemeral: true })
    }

    if (!target.isCommunicationDisabled()) {
      return interaction.reply({ content: "This user is not timed out.", ephemeral: true })
    }

    try {
      await interaction.client.moderation.removeTimeout(interaction.guild, interaction.user, target, reason)

      const embed = new EmbedBuilder()
        .setColor(0x6bff6b)
        .setTitle("Timeout Removed")
        .setThumbnail(target.user.displayAvatarURL())
        .addFields(
          { name: "User", value: `${target.user.tag}`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Reason", value: reason },
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to remove timeout.", ephemeral: true })
    }
  },
}
