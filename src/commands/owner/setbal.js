const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setbal")
    .setDescription("Set a user's balance (Owner only)")
    .addUserOption((opt) => opt.setName("user").setDescription("User").setRequired(true))
    .addIntegerOption((opt) => opt.setName("amount").setDescription("Amount").setRequired(true))
    .addStringOption((opt) =>
      opt
        .setName("type")
        .setDescription("Wallet or bank")
        .addChoices({ name: "Wallet", value: "wallet" }, { name: "Bank", value: "bank" }),
    ),
  ownerOnly: true,

  async execute(interaction) {
    if (interaction.user.id !== interaction.client.config.ownerId) {
      return interaction.reply({ content: "Owner only.", ephemeral: true })
    }

    const user = interaction.options.getUser("user")
    const amount = interaction.options.getInteger("amount")
    const type = interaction.options.getString("type") || "wallet"

    try {
      await interaction.client.economy.setBalance(user.id, amount, type)

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00ff00)
            .setDescription(`Set ${user.tag}'s ${type} to ${amount.toLocaleString()}`),
        ],
        ephemeral: true,
      })
    } catch (error) {
      await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true })
    }
  },
}
