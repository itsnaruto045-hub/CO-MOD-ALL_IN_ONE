const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addbal")
    .setDescription("Add to a user's balance (Owner only)")
    .addUserOption((opt) => opt.setName("user").setDescription("User").setRequired(true))
    .addIntegerOption((opt) => opt.setName("amount").setDescription("Amount").setRequired(true)),
  ownerOnly: true,

  async execute(interaction) {
    if (interaction.user.id !== interaction.client.config.ownerId) {
      return interaction.reply({ content: "Owner only.", ephemeral: true })
    }

    const user = interaction.options.getUser("user")
    const amount = interaction.options.getInteger("amount")

    try {
      await interaction.client.economy.addCoins(user.id, amount)

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00ff00)
            .setDescription(`Added ${amount.toLocaleString()} to ${user.tag}'s wallet`),
        ],
        ephemeral: true,
      })
    } catch (error) {
      await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true })
    }
  },
}
