const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const { loadCommands } = require("../../handlers/commandHandler")

module.exports = {
  data: new SlashCommandBuilder().setName("reload").setDescription("Reload all commands (Owner only)"),
  ownerOnly: true,

  async execute(interaction) {
    if (interaction.user.id !== interaction.client.config.ownerId) {
      return interaction.reply({ content: "Owner only.", ephemeral: true })
    }

    await interaction.deferReply({ ephemeral: true })

    try {
      // Clear command cache
      interaction.client.commands.clear()

      // Reload commands
      await loadCommands(interaction.client)

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00ff00)
            .setDescription(`Reloaded ${interaction.client.commands.size} commands.`),
        ],
      })
    } catch (error) {
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription(`Error: ${error.message}`)],
      })
    }
  },
}
