import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"

export default {
  data: new SlashCommandBuilder()
    .setName("tip")
    .setDescription("Tip crypto to another user")
    .addUserOption((opt) => opt.setName("user").setDescription("User to tip").setRequired(true))
    .addNumberOption((opt) =>
      opt.setName("amount").setDescription("Amount to tip").setRequired(true).setMinValue(0.00000001),
    )
    .addStringOption((opt) =>
      opt
        .setName("coin")
        .setDescription("Cryptocurrency to tip")
        .setRequired(true)
        .addChoices(
          { name: "Bitcoin (BTC)", value: "BTC" },
          { name: "Ethereum (ETH)", value: "ETH" },
          { name: "Litecoin (LTC)", value: "LTC" },
          { name: "Tether (USDT)", value: "USDT" },
          { name: "Dogecoin (DOGE)", value: "DOGE" },
        ),
    ),

  async execute(interaction, client) {
    const odbc = interaction.user.id
    const target = interaction.options.getUser("user")
    const amount = interaction.options.getNumber("amount")
    const coin = interaction.options.getString("coin")

    if (target.id === odbc) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "ERROR",
            description: "You cannot tip yourself.",
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }

    if (target.bot) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "ERROR",
            description: "You cannot tip bots.",
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }

    try {
      await client.crypto.tip(odbc, target.id, coin, amount)

      const info = client.crypto.getCoinInfo(coin)
      const price = client.crypto.getPrice(coin)
      const usdValue = amount * price

      const embed = createTerminalEmbed({
        title: "TIP SENT",
        description: [
          `┌─ TRANSACTION ─────────────┐`,
          `│ To:     ${target.username}`,
          `│ Amount: ${info.symbol} ${client.crypto.formatAmount(amount, coin)}`,
          `│ Value:  ~$${usdValue.toFixed(2)}`,
          `└───────────────────────────┘`,
        ].join("\n"),
        color: info.color,
      })

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "TIP FAILED",
            description: error.message,
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }
  },
}
