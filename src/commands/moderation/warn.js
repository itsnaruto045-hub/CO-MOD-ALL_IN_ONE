const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member")
    .addUserOption((option) => option.setName("user").setDescription("The user to warn").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for the warning"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember("user")
    const reason = interaction.options.getString("reason") || "No reason provided"

    if (!target) {
      return interaction.reply({ content: "User not found in this server.", ephemeral: true })
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: "You cannot warn yourself.", ephemeral: true })
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: "You cannot warn someone with equal or higher role.", ephemeral: true })
    }

    try {
      const warnCount = await interaction.client.moderation.warn(
        interaction.guild,
        interaction.user,
        target.user,
        reason,
      )

      const embed = new EmbedBuilder()
        .setColor(0xffd93d)
        .setTitle("Member Warned")
        .setThumbnail(target.user.displayAvatarURL())
        .addFields(
          { name: "User", value: `${target.user.tag}`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Reason", value: reason },
          { name: "Total Warnings", value: `${warnCount}`, inline: true },
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })

      // DM the user
      await target
        .send({
          embeds: [
            new EmbedBuilder()
              .setColor(0xffd93d)
              .setTitle(`You have been warned in ${interaction.guild.name}`)
              .addFields({ name: "Reason", value: reason }, { name: "Total Warnings", value: `${warnCount}` })
              .setTimestamp(),
          ],
        })
        .catch(() => {})
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to warn user.", ephemeral: true })
    }
  },
}
