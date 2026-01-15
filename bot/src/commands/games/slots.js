const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ApplicationCommandOptionType } = require("discord.js")
const { COOLDOWNS, GAMES } = require("../../utils/Constants")

class SlotsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "slots",
      description: "Play the slot machine",
      category: "Games",
      options: [
        {
          name: "bet",
          description: "Amount to bet",
          type: ApplicationCommandOptionType.Integer,
          required: true,
          minValue: 10,
        },
      ],
      cooldown: COOLDOWNS.SLOTS,
    })
  }

  async run(interaction) {
    const bet = interaction.options.getInteger("bet")
    const guildId = interaction.guild?.id || "global"

    const balance = await this.client.economyManager.getBalance(interaction.user.id, guildId)

    if (balance.wallet < bet) {
      return interaction.reply({
        embeds: [SDFEmbed.error("Insufficient balance")],
        ephemeral: true,
      })
    }

    await this.client.economyManager.removeMoney(interaction.user.id, guildId, bet, "wallet", "Slots bet")

    // Spin animation
    const spinEmbed = new SDFEmbed()
      .setTitle("`[ SLOTS ]`")
      .setDescription(`\`\`\`ansi
\u001b[0;36m╔══════════════════════════════╗
║     [ ? ] [ ? ] [ ? ]        ║
║       Spinning...            ║
╚══════════════════════════════╝
\`\`\``)
      .setColor(0x00aaff)

    const message = await interaction.reply({ embeds: [spinEmbed], fetchReply: true })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate results
    const symbols = GAMES.SLOTS_SYMBOLS
    const reels = [Helpers.randomChoice(symbols), Helpers.randomChoice(symbols), Helpers.randomChoice(symbols)]

    // Calculate winnings
    let multiplier = 0
    let jackpot = false

    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      if (reels[0] === "7️⃣") {
        multiplier = 10
        jackpot = true
      } else if (reels[0] === "💎") {
        multiplier = 7
      } else {
        multiplier = 5
      }
    } else if (reels[0] === reels[1] || reels[1] === reels[2]) {
      multiplier = 2
    }

    const winnings = bet * multiplier

    if (winnings > 0) {
      await this.client.economyManager.addMoney(interaction.user.id, guildId, winnings, "wallet", "Slots win")
    }

    const resultEmbed = new SDFEmbed()
      .setTitle(`\`[ SLOTS${jackpot ? " - JACKPOT!" : ""} ]\``)
      .setDescription(`\`\`\`ansi
${multiplier > 0 ? "\u001b[0;32m" : "\u001b[0;31m"}╔══════════════════════════════╗
║     [ ${reels[0]} ] [ ${reels[1]} ] [ ${reels[2]} ]       ║
╠══════════════════════════════╣
${
  multiplier > 0
    ? `║  WIN! ${multiplier}x multiplier         ║\n║  Prize: +${Helpers.formatNumber(winnings).padEnd(18)}║`
    : `║  No match - You lost         ║\n║  Lost: -${Helpers.formatNumber(bet).padEnd(19)}║`
}
╚══════════════════════════════╝
\`\`\``)
      .setColor(multiplier > 0 ? 0x00ff00 : 0xff0000)

    await message.edit({ embeds: [resultEmbed] })
  }
}

module.exports = SlotsCommand
