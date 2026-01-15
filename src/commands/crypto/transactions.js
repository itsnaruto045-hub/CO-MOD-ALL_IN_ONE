import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"

export default {
  data: new SlashCommandBuilder().setName("cryptohistory").setDescription("View your crypto transaction history"),

  async execute(interaction, client) {
    const odbc = interaction.user.id

    const transactions = await client.crypto.getTransactionHistory(odbc, 10)

    if (transactions.length === 0) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "NO TRANSACTIONS",
            description: "You have no crypto transaction history.",
            color: client.config.colors.warning,
          }),
        ],
        ephemeral: true,
      })
    }

    const lines = transactions.map((tx) => {
      const sign = tx.amount >= 0 ? "+" : ""
      const date = new Date(tx.createdAt).toLocaleDateString()
      return `│ ${date} ${tx.action.padEnd(12)} ${sign}${tx.amount.toFixed(6)} ${tx.currency}`
    })

    const embed = createTerminalEmbed({
      title: "TRANSACTION HISTORY",
      description: [`┌─ RECENT TRANSACTIONS ─────┐`, ...lines, `└───────────────────────────┘`].join("\n"),
      color: client.config.colors.primary,
    })

    await interaction.reply({ embeds: [embed], ephemeral: true })
  },
}
