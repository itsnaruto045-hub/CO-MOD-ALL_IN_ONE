import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"

export default {
  data: new SlashCommandBuilder().setName("prices").setDescription("View current crypto prices"),

  async execute(interaction, client) {
    await interaction.deferReply()

    await client.crypto.fetchPrices()

    const coins = ["BTC", "ETH", "LTC", "USDT", "DOGE"]
    const lines = []

    for (const coin of coins) {
      const info = client.crypto.getCoinInfo(coin)
      const price = client.crypto.getPrice(coin)
      lines.push(`│ ${coin.padEnd(5)} ${info.symbol}  $${price.toLocaleString().padStart(12)}`)
    }

    const embed = createTerminalEmbed({
      title: "CRYPTO PRICES",
      description: [
        `┌─ LIVE PRICES (USD) ───────┐`,
        ...lines,
        `└───────────────────────────┘`,
        ``,
        `Last updated: ${new Date().toLocaleTimeString()}`,
      ].join("\n"),
      color: client.config.colors.info,
    })

    await interaction.editReply({ embeds: [embed] })
  },
}
