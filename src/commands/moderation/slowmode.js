const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set slowmode for the current channel")
    .addIntegerOption((option) =>
      option
        .setName("seconds")
        .setDescription("Slowmode duration in seconds (0 to disable)")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const seconds = interaction.options.getInteger("seconds")

    try {
      await interaction.client.moderation.slowmode(interaction.channel, seconds)

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setDescription(seconds === 0 ? "Slowmode has been disabled." : `Slowmode set to **${seconds}** seconds.`)
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to set slowmode.", ephemeral: true })
    }
  },
}
