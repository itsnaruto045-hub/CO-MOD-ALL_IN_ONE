import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"

export default {
  data: new SlashCommandBuilder()
    .setName("cryptobalance")
    .setDescription("Check your crypto balances")
    .addStringOption((opt) =>
      opt
        .setName("coin")
        .setDescription("Specific coin to check")
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
    const specificCoin = interaction.options.getString("coin")

    await client.crypto.fetchPrices()

    if (specificCoin) {
      const balance = await client.crypto.getBalance(odbc, specificCoin)
      const price = client.crypto.getPrice(specificCoin)
      const info = client.crypto.getCoinInfo(specificCoin)
      const usdValue = balance * price

      const embed = createTerminalEmbed({
        title: `${info.name} BALANCE`,
        description: [
          `┌─ ${specificCoin} WALLET ─────────────┐`,
          `│ Balance: ${info.symbol} ${client.crypto.formatAmount(balance, specificCoin)}`,
          `│ Price:   $${price.toLocaleString()}`,
          `│ Value:   $${usdValue.toFixed(2)}`,
          `└───────────────────────────┘`,
        ].join("\n"),
        color: info.color,
      })

      return interaction.reply({ embeds: [embed] })
    }

    // Show all balances
    const balances = await client.crypto.getAllBalances(odbc)
    const coins = ["BTC", "ETH", "LTC", "USDT", "DOGE"]

    let totalUsd = 0
    const lines = []

    for (const coin of coins) {
      const balance = balances[coin] || 0
      const price = client.crypto.getPrice(coin)
      const info = client.crypto.getCoinInfo(coin)
      const usdValue = balance * price
      totalUsd += usdValue

      lines.push(
        `│ ${coin.padEnd(5)} ${info.symbol} ${client.crypto.formatAmount(balance, coin).padEnd(15)} $${usdValue.toFixed(2)}`,
      )
    }

    const embed = createTerminalEmbed({
      title: "CRYPTO PORTFOLIO",
      description: [
        `┌─ HOLDINGS ────────────────┐`,
        ...lines,
        `│───────────────────────────│`,
        `│ TOTAL VALUE: $${totalUsd.toFixed(2)}`,
        `└───────────────────────────┘`,
      ].join("\n"),
      color: client.config.colors.primary,
    })

    await interaction.reply({ embeds: [embed] })
  },
}
