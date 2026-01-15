import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"

export default {
  data: new SlashCommandBuilder()
    .setName("cryptodeposit")
    .setDescription("Get your crypto deposit address")
    .addStringOption((opt) =>
      opt
        .setName("coin")
        .setDescription("Cryptocurrency")
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
    const coin = interaction.options.getString("coin")

    const address = await client.crypto.getDepositAddress(odbc, coin)
    const info = client.crypto.getCoinInfo(coin)

    const embed = createTerminalEmbed({
      title: `${coin} DEPOSIT ADDRESS`,
      description: [
        `┌─ ${info.name.toUpperCase()} DEPOSIT ───────┐`,
        `│`,
        `│ ${address}`,
        `│`,
        `├───────────────────────────┤`,
        `│ IMPORTANT:`,
        `│ - Only send ${coin} to this address`,
        `│ - Minimum: 0.0001 ${coin}`,
        `│ - Processing: ~10-30 mins`,
        `└───────────────────────────┘`,
      ].join("\n"),
      color: info.color,
    })

    await interaction.reply({ embeds: [embed], ephemeral: true })
  },
}
