import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"
import { formatNumber } from "../../utils/helpers.js"

export default {
  data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Withdraw money from your bank")
    .addIntegerOption((opt) =>
      opt.setName("amount").setDescription("Amount to withdraw").setRequired(true).setMinValue(1),
    ),

  async execute(interaction, client) {
    const odbc = interaction.user.id
    const amount = interaction.options.getInteger("amount")

    try {
      await client.economy.withdraw(odbc, amount)
      const balance = await client.economy.getBalance(odbc)

      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "WITHDRAWAL COMPLETE",
            description: [
              `┌─ TRANSACTION ─────────────┐`,
              `│ Withdrawn: ${client.config.emojis.coin} ${formatNumber(amount)}`,
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
            title: "WITHDRAWAL FAILED",
            description: error.message,
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }
  },
}
