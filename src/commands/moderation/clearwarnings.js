const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")
const Guild = require("../../database/schemas/Guild")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearwarnings")
    .setDescription("Clear all warnings for a user")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to clear warnings for").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const target = interaction.options.getUser("user")
    const guildData = await Guild.findOne({ guildId: interaction.guild.id })

    if (!guildData?.moderation?.warnings?.get(target.id)?.length) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0x6bff6b).setDescription(`${target.tag} has no warnings to clear.`)],
      })
    }

    guildData.moderation.warnings.delete(target.id)
    await guildData.save()

    const embed = new EmbedBuilder()
      .setColor(0x6bff6b)
      .setTitle("Warnings Cleared")
      .setDescription(`All warnings for ${target.tag} have been cleared.`)
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  },
}
