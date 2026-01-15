const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const { ApplicationCommandOptionType } = require("discord.js")
const { CRYPTO, COOLDOWNS } = require("../../utils/Constants")

class RainCommand extends Command {
  constructor(client) {
    super(client, {
      name: "rain",
      description: "Rain cryptocurrency on active users",
      category: "Crypto",
      options: [
        {
          name: "amount",
          description: "Total amount to rain",
          type: ApplicationCommandOptionType.Number,
          required: true,
          minValue: 0.0001,
        },
        {
          name: "crypto",
          description: "Cryptocurrency to rain",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: CRYPTO.SUPPORTED.map((c) => ({ name: c, value: c })),
        },
      ],
      cooldown: COOLDOWNS.CRYPTO_RAIN,
    })
  }

  async run(interaction) {
    const amount = interaction.options.getNumber("amount")
    const symbol = interaction.options.getString("crypto")

    await interaction.deferReply()

    // Get recent active users from the channel
    const messages = await interaction.channel.messages.fetch({ limit: 50 })
    const activeUsers = [
      ...new Set(messages.filter((m) => !m.author.bot && m.author.id !== interaction.user.id).map((m) => m.author.id)),
    ].slice(0, CRYPTO.RAIN_MAX_USERS)

    if (activeUsers.length < CRYPTO.RAIN_MIN_USERS) {
      return interaction.editReply({
        embeds: [SDFEmbed.error(`Need at least ${CRYPTO.RAIN_MIN_USERS} active users to rain`)],
      })
    }

    try {
      const result = await this.client.cryptoManager.rain(interaction.user.id, symbol, amount, activeUsers)

      const embed = new SDFEmbed()
        .setTitle("`[ CRYPTO RAIN ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;36m╔══════════════════════════════╗
║    It's raining crypto!      ║
╠══════════════════════════════╣
║  Total: ${amount} ${symbol.padEnd(17)}║
║  Recipients: ${String(result.recipientCount).padEnd(15)}║
║  Each got: ${result.amountPerUser.toFixed(8).padEnd(16)}║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0x00aaff)

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      await interaction.editReply({
        embeds: [SDFEmbed.error(error.message)],
      })
    }
  }
}

module.exports = RainCommand
