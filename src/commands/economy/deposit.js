import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"
import { formatNumber } from "../../utils/helpers.js"

export default {
  data: new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Deposit money into your bank")
    .addIntegerOption((opt) =>
      opt.setName("amount").setDescription('Amount to deposit (or "all")').setRequired(true).setMinValue(1),
    ),

  async execute(interaction, client) {
    const odbc = interaction.user.id
    const amount = interaction.options.getInteger("amount")

    try {
      const deposited = await client.economy.deposit(odbc, amount)
      const balance = await client.economy.getBalance(odbc)

      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "DEPOSIT COMPLETE",
            description: [
              `┌─ TRANSACTION ─────────────┐`,
              `│ Deposited: ${client.config.emojis.coin} ${formatNumber(deposited)}`,
              `│───────────────────────────│`,
              `│ Wallet: ${client.config.emojis.coin} ${formatNumber(balance.wallet)}`,
              `│ Bank:   ${client.config.emojis.coin} ${formatNumber(balance.bank)}`,
              `└───────────────────────────┘`,
            ].join("\n"),
            color: client.config.colors.success,
          }),
        ],
      })
    } catch (error) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "DEPOSIT FAILED",
            description: error.message,
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }
  },
}
