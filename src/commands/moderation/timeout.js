const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member")
    .addUserOption((option) => option.setName("user").setDescription("The user to timeout").setRequired(true))
    .addStringOption((option) =>
      option.setName("duration").setDescription("Duration (e.g., 1h, 30m, 1d)").setRequired(true),
    )
    .addStringOption((option) => option.setName("reason").setDescription("Reason for the timeout"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember("user")
    const durationStr = interaction.options.getString("duration")
    const reason = interaction.options.getString("reason") || "No reason provided"

    if (!target) {
      return interaction.reply({ content: "User not found in this server.", ephemeral: true })
    }

    if (!target.moderatable) {
      return interaction.reply({ content: "I cannot timeout this user.", ephemeral: true })
    }

    const duration = interaction.client.moderation.parseDuration(durationStr)
    if (!duration || duration < 1000 || duration > 28 * 24 * 60 * 60 * 1000) {
      return interaction.reply({ content: "Invalid duration. Must be between 1 second and 28 days.", ephemeral: true })
    }

    try {
      await interaction.client.moderation.timeout(interaction.guild, interaction.user, target, duration, reason)

      const embed = new EmbedBuilder()
        .setColor(0xff9500)
        .setTitle("Member Timed Out")
        .setThumbnail(target.user.displayAvatarURL())
        .addFields(
          { name: "User", value: `${target.user.tag}`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Duration", value: interaction.client.moderation.formatDuration(duration), inline: true },
          { name: "Reason", value: reason },
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to timeout user.", ephemeral: true })
    }
  },
}
