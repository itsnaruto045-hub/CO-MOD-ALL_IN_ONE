const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ECONOMY, COOLDOWNS } = require("../../utils/Constants")

class MonthlyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "monthly",
      description: "Claim your monthly reward",
      category: "Economy",
      cooldown: 0,
    })
  }

  async run(interaction) {
    const userId = interaction.user.id
    const guildId = interaction.guild?.id || "global"

    const user = await this.client.economyManager.getUser(userId, guildId)

    const lastClaim = user.streaks?.monthly?.lastClaim
    if (lastClaim) {
      const timeSince = Date.now() - new Date(lastClaim).getTime()
      if (timeSince < COOLDOWNS.MONTHLY) {
        const remaining = COOLDOWNS.MONTHLY - timeSince
        return interaction.reply({
          embeds: [SDFEmbed.warning(`You can claim again in ${Helpers.formatDuration(remaining)}`)],
          ephemeral: true,
        })
      }
    }

    let streak = user.streaks?.monthly?.count || 0
    if (lastClaim) {
      const daysSince = (Date.now() - new Date(lastClaim).getTime()) / 86400000
      if (daysSince <= 60) {
        streak++
      } else {
        streak = 1
      }
    } else {
      streak = 1
    }

    const baseAmount = ECONOMY.MONTHLY_AMOUNT
    const streakBonus = Math.min(streak * 2500, 25000)
    const totalAmount = baseAmount + streakBonus

    user.wallet += totalAmount
    user.streaks = user.streaks || {}
    user.streaks.monthly = {
      count: streak,
      lastClaim: new Date(),
    }
    await user.save()

    const embed = new SDFEmbed()
      .setTitle("`[ MONTHLY REWARD ]`")
      .setDescription(`\`\`\`ansi
\u001b[0;33m╔══════════════════════════════╗
║       REWARD CLAIMED!        ║
╠══════════════════════════════╣
║  Base:    +${Helpers.formatNumber(baseAmount).padEnd(16)}║
║  Streak:  +${Helpers.formatNumber(streakBonus).padEnd(16)}║
╠══════════════════════════════╣
║  Total:   +${Helpers.formatNumber(totalAmount).padEnd(16)}║
║  Streak:  ${String(streak).padEnd(13)}months ║
╚══════════════════════════════╝
\`\`\``)
      .setColor(0xffd700)

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports = MonthlyCommand
