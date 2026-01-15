const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server")
    .addUserOption((option) => option.setName("user").setDescription("The user to ban").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for the ban"))
    .addIntegerOption((option) =>
      option.setName("days").setDescription("Number of days of messages to delete (0-7)").setMinValue(0).setMaxValue(7),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getUser("user")
    const reason = interaction.options.getString("reason") || "No reason provided"
    const days = interaction.options.getInteger("days") || 0

    const member = interaction.guild.members.cache.get(target.id)
    if (member) {
      if (!member.bannable) {
        return interaction.reply({ content: "I cannot ban this user.", ephemeral: true })
      }
      if (member.roles.highest.position >= interaction.member.roles.highest.position) {
        return interaction.reply({ content: "You cannot ban someone with equal or higher role.", ephemeral: true })
      }
    }

    try {
      await interaction.client.moderation.ban(interaction.guild, interaction.user, target, reason, days)

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Member Banned")
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: "User", value: `${target.tag}`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Reason", value: reason },
          { name: "Messages Deleted", value: `${days} day(s)`, inline: true },
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to ban user.", ephemeral: true })
    }
  },
}
