const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder().setName("shutdown").setDescription("Shutdown the bot (Owner only)"),
  ownerOnly: true,

  async execute(interaction) {
    if (interaction.user.id !== interaction.client.config.ownerId) {
      return interaction.reply({ content: "Owner only.", ephemeral: true })
    }

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("Shutting down...")],
    })

    setTimeout(() => {
      interaction.client.destroy()
      process.exit(0)
    }, 2000)
  },
}
