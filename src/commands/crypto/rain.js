import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"

export default {
  data: new SlashCommandBuilder()
    .setName("rain")
    .setDescription("Rain crypto on active users in the channel")
    .addNumberOption((opt) =>
      opt.setName("amount").setDescription("Total amount to distribute").setRequired(true).setMinValue(0.0001),
    )
    .addStringOption((opt) =>
      opt
        .setName("coin")
        .setDescription("Cryptocurrency to rain")
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
    const totalAmount = interaction.options.getNumber("amount")
    const coin = interaction.options.getString("coin")

    await interaction.deferReply()

    try {
      // Get recent messages to find active users
      const messages = await interaction.channel.messages.fetch({ limit: 50 })
      const activeUsers = new Set()

      messages.forEach((msg) => {
        if (!msg.author.bot && msg.author.id !== odbc) {
          activeUsers.add(msg.author.id)
        }
      })

      const recipients = Array.from(activeUsers).slice(0, 10) // Max 10 recipients

      if (recipients.length === 0) {
        return interaction.editReply({
          embeds: [
            createTerminalEmbed({
              title: "RAIN FAILED",
              description: "No active users found in this channel.",
              color: client.config.colors.error,
            }),
          ],
        })
      }

      const result = await client.crypto.rain(odbc, coin, totalAmount, recipients)

      const info = client.crypto.getCoinInfo(coin)
      const price = client.crypto.getPrice(coin)

      const embed = createTerminalEmbed({
        title: `${coin} RAIN`,
        description: [
          `┌─ RAIN SUMMARY ────────────┐`,
          `│ Total:      ${info.symbol} ${client.crypto.formatAmount(totalAmount, coin)}`,
          `│ Recipients: ${result.recipientCount} users`,
          `│ Each got:   ${info.symbol} ${client.crypto.formatAmount(result.amountPerUser, coin)}`,
          `│ (~$${(result.amountPerUser * price).toFixed(4)} each)`,
          `└───────────────────────────┘`,
          ``,
          `Rained by ${interaction.user.username}`,
        ].join("\n"),
        color: info.color,
      })

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      return interaction.editReply({
        embeds: [
          createTerminalEmbed({
            title: "RAIN FAILED",
            description: error.message,
            color: client.config.colors.error,
          }),
        ],
      })
    }
  },
}
