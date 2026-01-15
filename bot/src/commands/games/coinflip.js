const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { COOLDOWNS } = require("../../utils/Constants")

class CoinflipCommand extends Command {
  constructor(client) {
    super(client, {
      name: "coinflip",
      description: "Flip a coin and bet on the outcome",
      category: "Games",
      options: [
        {
          name: "bet",
          description: "Amount to bet",
          type: ApplicationCommandOptionType.Integer,
          required: true,
          minValue: 10,
        },
        {
          name: "choice",
          description: "Heads or tails",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: "Heads", value: "heads" },
            { name: "Tails", value: "tails" },
          ],
        },
      ],
      cooldown: COOLDOWNS.COINFLIP,
    })
  }

  async run(interaction) {
    const bet = interaction.options.getInteger("bet")
    const choice = interaction.options.getString("choice")
    const guildId = interaction.guild?.id || "global"

    const balance = await this.client.economyManager.getBalance(interaction.user.id, guildId)

    if (balance.wallet < bet) {
      return interaction.reply({
        embeds: [SDFEmbed.error("Insufficient balance")],
        ephemeral: true,
      })
    }

    // Deduct bet
    await this.client.economyManager.removeMoney(interaction.user.id, guildId, bet, "wallet", "Coinflip bet")

    // Animated flipping
    const loadingEmbed = new SDFEmbed()
      .setTitle("`[ COINFLIP ]`")
      .setDescription(`\`\`\`ansi
\u001b[0;36m╔══════════════════════════════╗
║      Flipping coin...        ║
║           🪙                 ║
╚══════════════════════════════╝
\`\`\``)
      .setColor(0x00aaff)

    const message = await interaction.reply({ embeds: [loadingEmbed], fetchReply: true })

    // Simulate animation delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const result = Math.random() < 0.5 ? "heads" : "tails"
    const won = result === choice

    if (won) {
      const winnings = bet * 2
      await this.client.economyManager.addMoney(interaction.user.id, guildId, winnings, "wallet", "Coinflip win")

      const winEmbed = new SDFEmbed()
        .setTitle("`[ COINFLIP - WIN ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║    Result: ${result.toUpperCase().padEnd(17)}║
║    Your bet: ${choice.toUpperCase().padEnd(15)}║
╠══════════════════════════════╣
║    YOU WON!                  ║
║    Prize: +${Helpers.formatNumber(winnings).padEnd(17)}║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0x00ff00)

      await message.edit({ embeds: [winEmbed] })
    } else {
      const loseEmbed = new SDFEmbed()
        .setTitle("`[ COINFLIP - LOSS ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;31m╔══════════════════════════════╗
║    Result: ${result.toUpperCase().padEnd(17)}║
║    Your bet: ${choice.toUpperCase().padEnd(15)}║
╠══════════════════════════════╣
║    YOU LOST!                 ║
║    Lost: -${Helpers.formatNumber(bet).padEnd(18)}║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0xff0000)

      await message.edit({ embeds: [loseEmbed] })
    }
  }
}

module.exports = CoinflipCommand
