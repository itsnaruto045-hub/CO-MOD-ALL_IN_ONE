const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .addUserOption((option) => option.setName("user").setDescription("The user to kick").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for the kick"))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getMember("user")
    const reason = interaction.options.getString("reason") || "No reason provided"

    if (!target) {
      return interaction.reply({ content: "User not found in this server.", ephemeral: true })
    }

    if (!target.kickable) {
      return interaction.reply({
        content: "I cannot kick this user. They may have higher permissions.",
        ephemeral: true,
      })
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: "You cannot kick someone with equal or higher role.", ephemeral: true })
    }

    try {
      await interaction.client.moderation.kick(interaction.guild, interaction.user, target, reason)

      const embed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle("Member Kicked")
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
      await interaction.reply({ content: "Failed to kick user.", ephemeral: true })
    }
  },
}
